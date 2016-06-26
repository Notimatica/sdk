import log from 'loglevel'
import events from 'minivents'
import visitor from '../visitor'
import { subscribe, unsubscribe } from '../api'
import { merge, makeToken, isHttps } from '../utils'
import { DEBUG, PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../defaults'

const Notimatica = {
  _inited: false,
  _provider: null,
  _subscribed: false,
  options: {
    debug: DEBUG,
    project: null,
    autoSubscribe: true
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init (options) {
    if (Notimatica._inited) return log.warn('Notimatica SDK was already inited.')

    options = options || {}
    merge(Notimatica.options, options)

    if (Notimatica.options.debug) {
      log.setLevel(log.levels.TRACE)
    } else {
      log.setLevel(log.levels.WARN)
    }

    if (Notimatica.options.project === null) return log.error('Project ID is absent.')

    Notimatica.detectProvider()

    Notimatica.inited()

    if (Notimatica.pushSupported() && Notimatica.autoSubscribe()) {
      Notimatica.subscribe()
    }
  },

  /**
   * SDK inited.
   */
  inited () {
    Notimatica._inited = true
    Notimatica.emit('notimatica:init')
    log.info('Notimatica SDK inited with', Notimatica.options)
  },

  /**
   * If automatic subscription allowed.
   * @returns {Boolean}
   */
  autoSubscribe () {
    return Notimatica.options.autoSubscribe && Notimatica.options.subdomain === null
  },

  /**
   * Detect provider from browser.
   *
   * @returns {String|null}
   */
  detectProvider () {
    let provider
    switch (visitor.browser) {
      case 'Chrome':
        provider = PROVIDER_CHROME
        break
      case 'Firefox':
        provider = PROVIDER_FIREFOX
        break
      case 'Safari':
        provider = PROVIDER_SAFARI
        break
      default:
        provider = PROVIDER_UNKNOWN
        break
    }

    const Provider = require('./providers/' + provider)
    Notimatica._provider = new Provider(Notimatica.options)
  },

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported () {
    return Notimatica._provider.pushSupported()
  },

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe () {
    return new Promise(function (resolve, reject) {
      return isHttps() ? Notimatica._subscribeHttps() : Notimatica._subscribeHttp()
    })
      .then(() => Notimatica.emit('notimatica:subscribe:success'))
      .catch(() => Notimatica.emit('notimatica:subscribe:fail'))
  },

  /**
   * Subscribe for https sites via native sdk.
   *
   * @return {Promise}
   */
  _subscribeHttps () {
    return Notimatica._provider.ready()
      .then(() => Notimatica._provider.subscribe())
      .then(({ existed, result }) => {
        if (existed) return result

        return result.then((subscription) => Notimatica._register(subscription))
      })
      .then((subscription) => {
        Notimatica._subscribed = true
        log.debug('Retrieved subscription', subscription)
      })
      .catch((err) => log.trace(err))
  },

  /**
   * Subscribe for http sites via popup.
   *
   * @return {Promise}
   */
  _subscribeHttp () {
    const href = `https://notimatica.io/subscribe/${Notimatica.options.project}.`
    window.open(href, 'notimatica', 'width=500,height=500')
  },

  /**
   * Subscribe to notifications.
   *
   * @param   {Object} subscription
   * @returns {Object}
   */
  _register (subscription) {
    let data = {
      provider: Notimatica._provider.name,
      token: makeToken(subscription.endpoint, Notimatica._provider),
      browser: visitor.browser,
      browser_version: visitor.browserMajorVersion,
      cookies: visitor.cookies,
      flash: visitor.flashVersion,
      mobile: visitor.mobile,
      os: visitor.os,
      os_version: visitor.osVersion,
      screen: visitor.screen,
      timezone: visitor.timezone,
      language: visitor.language
    }

    log.debug('Subscribing user', data)
    subscribe(Notimatica.options.project, data)
      .then((data) => log.debug('Subscribed', data))
      .catch((res) => log.error(res))

    return subscription
  },

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return Notimatica._provider.unsubscribe()
      .then((subscription) => Notimatica._unregister(subscription))
      .then(() => Notimatica.emit('notimatica:unsubscribe:success'))
      .catch(() => Notimatica.emit('notimatica:unsubscribe:fail'))
  },

  /**
   * Delete subscription from notimatica.
   *
   * @param  {Object|null} subscription Subscription object
   * @return {Promise}
   */
  _unregister (subscription) {
    if (!subscription) return

    const data = {
      token: makeToken(subscription.endpoint, Notimatica._provider)
    }

    Notimatica._subscribed = false

    log.debug('Unsubscribing user', data)
    return unsubscribe(Notimatica.options.project, data)
      .then(() => log.debug('Unsubscribed'))
      .catch((res) => log.error(res))
  },

  /**
   * If user is subscribed.
   *
   * @return {Boolean}
   */
  isSubscribed () {
    return Notimatica._subscribed
  },

  /**
   * If user is unsubscribed.
   *
   * @return {Boolean}
   */
  isUnsubscribed () {
    return !Notimatica._subscribed
  },

  /**
   * Implement array's push method to handle push calls.
   *
   * @param  {Array|Function} item Method call. [method_name, args...]
   */
  push (item) {
    if (typeof item === 'function') {
      item()
    } else {
      const functionName = item.shift()
      Notimatica[functionName].apply(null, item)
    }
  },

  /**
   * Handle already registered actions.
   *
   * @param  {Array} array History of calls
   */
  _processRegisteredActions (array) {
    for (let i = 0; i < array.length; i++) {
      Notimatica.push(array[i])
    }
  }
}

events(Notimatica)

module.exports = Notimatica
