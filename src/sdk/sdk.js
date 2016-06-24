import log from 'loglevel'
import visitor from '../visitor'
import { subscribe, unsubscribe } from '../api'
import { merge, makeToken } from '../utils'
import { DEBUG, PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../defaults'

const Notimatica = {
  _inited: false,
  _provider: null,
  _subscribed: false,
  options: {
    debug: DEBUG,
    project: null,
    autoSubscribe: true,
    subdomain: null
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init: function (options) {
    if (Notimatica._inited) return log.warn('Notimatica SDK was already inited.')

    options = options || {}
    merge(Notimatica.options, options)

    if (Notimatica.options.project === null) return log.error('Project ID is absent.')

    if (Notimatica.options.debug) {
      log.setLevel(log.levels.TRACE)
    } else {
      log.setLevel(log.levels.ERROR)
    }

    Notimatica._provider = Notimatica.detectProvider()

    if (Notimatica.pushSupported() && Notimatica.autoSubscribe()) {
      Notimatica.subscribe()
    }

    Notimatica.inited()
  },

  /**
   * SDK inited.
   */
  inited: function () {
    Notimatica._inited = true
    log.info('Notimatica SDK inited with', Notimatica.options)
  },

  /**
   * If automatic subscription allowed.
   * @returns {Boolean}
   */
  autoSubscribe: function () {
    return Notimatica.options.autoSubscribe && Notimatica.options.subdomain === null
  },

  /**
   * Detect provider from browser.
   *
   * @returns {String|null}
   */
  detectProvider: function () {
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
    return new Provider(Notimatica.options)
  },

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported: function () {
    return Notimatica._provider.pushSupported()
  },

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe: function () {
    return Notimatica._provider.ready()
      .then(() => Notimatica._provider.subscribe())
      .then(({ existed, result }) => {
        if (!existed) {
          return result.then((subscription) => {
            Notimatica._register(subscription)
            return subscription
          })
        }

        return result
      })
      .then((subscription) => log.debug('Retrieved subscription', subscription))
      .catch((err) => log.trace(err))
  },

  /**
   * Subscribe to notifications.
   *
   * @param   {Object} subscription
   * @returns {Promise}
   */
  _register: function (subscription) {
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
    return subscribe(Notimatica.options.project, data)
      .then((data) => log.debug('Subscribed', data))
      .catch((res) => log.error(res))
  },

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe: function () {
    return Notimatica._provider.unsubscribe()
      .then((subscription) => Notimatica._unregister(subscription))
  },

  /**
   * Delete subscription from notimatica.
   *
   * @param  {Object} subscription Subscription object
   * @return {Promise}
   */
  _unregister: function (subscription) {
    const data = {
      token: makeToken(subscription.endpoint, Notimatica._provider)
    }

    log.debug('Unsubscribing user', data)
    return unsubscribe(Notimatica.options.project, data)
      .then((data) => log.debug('Unsubscribed', data))
      .catch((res) => log.error(res))
  },

  /**
   * If user is subscribed.
   *
   * @return {Boolean}
   */
  isSubscribed: function () {
    return Notimatica._subscribed
  },

  /**
   * If user is unsubscribed.
   *
   * @return {Boolean}
   */
  isUnsubscribed: function () {
    return !Notimatica._subscribed
  },

  /**
   * Implement array's push method to handle push calls.
   *
   * @param  {Array|Function} item Method call. [method_name, args...]
   */
  push: function (item) {
    if (typeof item === 'function') {
      item()
    } else {
      var functionName = item.shift()
      Notimatica[functionName].apply(null, item)
    }
  },

  /**
   * Handle already registered actions.
   *
   * @param  {Array} array History of calls
   */
  _process_pushes: function (array) {
    for (var i = 0; i < array.length; i++) {
      Notimatica.push(array[i])
    }
  }
}

module.exports = Notimatica
