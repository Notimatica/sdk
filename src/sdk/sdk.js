import log from 'loglevel'
import events from 'minivents'
import Visitor from '../visitor'
import Popup from '../popup'
import { subscribe, unsubscribe } from '../api'
import { merge, makeToken, isHttps } from '../utils'
import { DEBUG, PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../defaults'

const Notimatica = {
  _inited: false,
  _provider: null,
  _visitor: null,
  _subscribed: false,
  _popup: null,
  options: {
    debug: DEBUG,
    project: null,
    autoSubscribe: true,
    usePopup: false
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init (options) {
    if (Notimatica._inited) return log.warn('Notimatica SDK was already inited.')

    merge(Notimatica.options, options || {})

    if (Notimatica.options.debug) {
      log.setLevel(log.levels.TRACE)
    } else {
      log.setLevel(log.levels.WARN)
    }

    if (Notimatica.options.project === null) return log.error('Project ID is absent.')

    Notimatica._prepareVisitor()
    Notimatica._preparePopup(Notimatica._visitor)
    Notimatica._prepareProvider()

    if (Notimatica.pushSupported() && !Notimatica._usePopup()) {
      Notimatica._provider.ready()
        .then((subscription) => {
          Notimatica._ready(subscription)
            .then((wasUnsibscribed) => {
              if (Notimatica._autoSubscribe() && Notimatica.isUnsubscribed() && !wasUnsibscribed) {
                Notimatica.subscribe()
              }
            })
        })
    } else {
      Notimatica._popup.ready()
        .then((subscription) => {
          Notimatica._ready(subscription)
        })
    }
  },

  /**
   * SDK is ready.
   *
   * @param  {Object|Null} subscription Subscription
   */
  _ready (subscription) {
    Notimatica._subscribed = subscription !== null
    Notimatica._inited = true
    Notimatica.emit('ready')
    log.info('Notimatica SDK inited with', Notimatica.options)

    return Notimatica._visitor.wasUnsubscribed()
  },

  /**
   * If automatic subscription allowed.
   *
   * @returns {Boolean}
   */
  _autoSubscribe () {
    return Notimatica.options.autoSubscribe
  },

  /**
   * Prepare visitor.
   */
  _prepareVisitor () {
    Notimatica._visitor = new Visitor()
  },

  /**
   * Prepare popup.
   *
   * @param  {Object} visitor The visitor object.
   */
  _preparePopup (visitor) {
    Notimatica._popup = new Popup(visitor)

    Notimatica.on('popup:subscribed', (data) => {
      Notimatica._visitor.token(data.token)
        .then(() => {
          Notimatica._subscribed = true
          Notimatica.emit('subscribe:success', data.token)
        })
    })

    Notimatica.on('popup:unsubscribed', () => {
      Notimatica._visitor.token(null)
        .then(() => {
          Notimatica._subscribed = false
          Notimatica.emit('unsubscribe:success')
        })
    })
  },

  /**
   * Detect provider from browser.
   */
  _prepareProvider () {
    let provider
    switch (Notimatica._visitor.browser) {
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
   */
  subscribe () {
    if (!Notimatica.pushSupported()) {
      Notimatica.emit('subscribe:fail', 'Web push unsupported by browser.')
      return
    }

    if (Notimatica.isSubscribed()) {
      Notimatica._visitor.token()
        .then((token) => Notimatica.emit('subscribe:success', token))
      return
    }

    Notimatica._usePopup() ? Notimatica._subscribeViaPopup() : Notimatica._subscribeViaNative()
  },

  /**
   * Use popup or native subscription process.
   *
   * @return {Boolean}
   */
  _usePopup () {
    return !isHttps() || Notimatica.options.usePopup
  },

  /**
   * Subscribe for https sites using native sdk.
   *
   * @return {Promise}
   */
  _subscribeViaNative () {
    Notimatica.emit('subscribe:start')

    return Notimatica._provider.subscribe()
      .then((subscription) => Notimatica._register(subscription))
      .then((subscription) => {
        Notimatica._subscribed = true

        Notimatica._visitor.unsubscribe(null)
          .then(() => Notimatica._visitor.token())
          .then((token) => {
            Notimatica.emit('subscribe:success', token)
            log.debug('Retrieved subscription', subscription)
          })
      })
      .catch((err) => {
        log.trace(err)
        Notimatica.emit('subscribe:fail', err)
      })
  },

  /**
   * Subscribe for http sites using Notimatica popup.
   *
   * @return {Promise}
   */
  _subscribeViaPopup () {
    Notimatica._popup.open(Notimatica.options.project)
  },

  /**
   * Subscribe to notifications.
   *
   * @param   {Object} subscription
   * @returns {Object}
   */
  _register (subscription) {
    const visitor = Notimatica._visitor.info
    const data = {
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
      .then((data) => {
        Notimatica._visitor.token(data.subscriber.token)
          .then(() => log.debug('Subscribed', data))

        return subscription
      })
      .catch((err) => log.error(err))
  },

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    if (Notimatica.isUnsubscribed()) {
      Notimatica.emit('unsubscribe:success')
      return
    }

    (Notimatica._usePopup() ? Notimatica._unsubscribeViaPopup() : Notimatica._unsubscribeViaNative())
  },

  /**
   * Unsubscribe via native.
   *
   * @return {Promise}
   */
  _unsubscribeViaNative () {
    return Notimatica._provider.unsubscribe()
      .then((subscription) => Notimatica._unregister(subscription.endpoint))
      .then(() => {
        Notimatica._subscribed = false
        Notimatica._visitor.token(null)
        Notimatica._visitor.unsubscribe()
      })
      .then(() => Notimatica.emit('unsubscribe:success'))
      .catch((err) => Notimatica.emit('unsubscribe:fail', err))
  },

  /**
   * Unsubscribe via popup.
   *
   * @return {Promise}
   */
  _unsubscribeViaPopup () {
    return Notimatica._popup.open(Notimatica.options.project)
  },

  /**
   * Delete subscription from notimatica.
   *
   * @param  {Object|null} subscription Subscription object
   * @return {Promise}
   */
  _unregister (subscription) {
    console.log(subscription)
    if (!subscription) return

    const data = {
      token: makeToken(subscription, Notimatica._provider)
    }

    log.debug('Unsubscribing user', data)
    return unsubscribe(Notimatica.options.project, data)
      .then(() => log.debug('Unsubscribed'))
      .catch((err) => log.error(err))
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
