import * as api from '../api'
import * as utils from '../utils'
import config from '../config'
import visitor from '../visitor'
import log from 'loglevel'

const Notimatica = {
  options: {

  },
  _inited: false,
  init: function (options) {
    if (Notimatica._inited) {
      return log.warn('SDK was already inited')
    }

    utils.merge(Notimatica.options, options)

    if (Notimatica.pushSupported()) {
      Notimatica.register()
    }

    Notimatica._inited = true
    log.info('SDK inited with', Notimatica.options)
  },

  pushSupported: function () {
    return 'serviceWorker' in navigator
  },

  subscribe: function (registration) {
    registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        let data = {
          endpoint: subscription.endpoint,
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

        data.provider = utils.provider(data.browser)

        log.debug('Subscribing user', data)
        api.subscribe(Notimatica.options.apiId, data)
          .then((data) => log.debug('Subscribed', data))
          .catch((res) => {
            log.error(res)
          })
      })
  },

  register: function () {
    navigator.serviceWorker.register('/notimatica-sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', updateFound)
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
   * Implement array's push method to handle push calls.
   *
   * @param  {Array} item Method call. [method_name, args...]
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

const updateFound = function () {
  // var installingWorker = this.installing
  //
  // // Wait for the new service worker to be installed before prompting to update.
  // installingWorker.addEventListener('statechange', () => {
  //   switch (installingWorker.state) {
  //     case 'installed':
  //       log.info('Installed', installingWorker)
  //       // Only show the prompt if there is currently a controller so it is not
  //       // shown on first load.
  //       if (navigator.serviceWorker.controller &&
  //         window.confirm('An updated version of this page is available, would you like to update?')) {
  //         window.location.reload()
  //         return
  //       }
  //       break
  //
  //     case 'redundant':
  //       log.error('The installing service worker became redundant.')
  //       break
  //   }
  // })
}

if (config.debug) {
  log.setLevel(log.levels.TRACE)
} else {
  log.setLevel(log.levels.ERROR)
}

module.exports = Notimatica
