import log from 'loglevel'
import visitor from '../visitor'
import { subscribe } from '../api'
import { merge, makeToken } from '../utils'
import { DEBUG, SDK_PATH, PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI } from '../defaults'

const Notimatica = {
  _inited: false,
  _provider: null,
  options: {
    debug: DEBUG,
    sdkPath: SDK_PATH,
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

    if (Notimatica.options.debug) {
      log.setLevel(log.levels.TRACE)
    } else {
      log.setLevel(log.levels.ERROR)
    }

    Notimatica._provider = Notimatica.detectProvider()

    if (Notimatica.pushSupported() && Notimatica.autoSubscribe()) {
      Notimatica.register()
    }

    Notimatica.inited()
    log.info('Notimatica SDK inited with', Notimatica.options)
  },

  /**
   * SDK inited.
   */
  inited: function () {
    Notimatica._inited = true
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
    switch (visitor.browser) {
      case 'Chrome':
        return PROVIDER_CHROME
      case 'Firefox':
        return PROVIDER_FIREFOX
      case 'Safari':
        return PROVIDER_SAFARI
      default:
        return null
    }
  },

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported: function () {
    switch (Notimatica._provider) {
      case PROVIDER_CHROME:
      case PROVIDER_FIREFOX:
        return 'serviceWorker' in navigator
      case PROVIDER_SAFARI:
        return 'safari' in window && 'pushNotification' in window.safari
      default:
        return false
    }
  },

  /**
   * Register service worker.
   */
  register: function () {
    navigator.serviceWorker.register(Notimatica.options.sdkPath + '/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', Notimatica.updateFoundEvent)
        return registration
      })
      .then((registration) => {
        return registration.pushManager.getSubscription()
          .then((subscription) => {
            if (subscription) {
              log.debug('Already subscribed', subscription)
              return subscription
            }

            return Notimatica.subscribe(registration)
          })
      })
  },

  /**
   * Subscribe to notifications.
   *
   * @param   {Object} registration
   * @returns {Promise}
   */
  subscribe: function (registration) {
    return registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        let data = {
          provider: Notimatica._provider,
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

        data.token = makeToken(subscription.endpoint, Notimatica._provider)

        log.debug('Subscribing user', data)
        subscribe(Notimatica.options.project, data)
          .then((data) => log.debug('Subscribed', data))
          .catch((res) => log.error(res))
      })
  },

  updateFoundEvent: function () {
    var installingWorker = this.installing

    // Wait for the new service worker to be installed before prompting to update.
    installingWorker.addEventListener('statechange', () => {
      switch (installingWorker.state) {
        case 'installed':
          log.info('Installed worker', installingWorker)
          break
        case 'redundant':
          log.error('The installing service worker became redundant.')
          break
      }
    })
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
