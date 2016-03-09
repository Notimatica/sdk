import * as utils from '../utils'
import * as env from '../env'
import * as api from '../api'
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
        api.subscribe(Notimatica.options.apiId, subscription.endpoint)
          .catch((res) => {
            console.log(res)
          })
      })
  },

  register: function () {
    navigator.serviceWorker.register('/js/sw.js')
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
            log.debug('Subscribing', registration)
            return Notimatica.subscribe(registration)
          })
      })
  },

  push: function (item) {
    if (typeof item === 'function') {
      item()
    } else {
      var functionName = item.shift()
      Notimatica[functionName].apply(null, item)
    }
  },

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

if (env.DEBUG) {
  log.setLevel(log.levels.TRACE)
} else {
  log.setLevel(log.levels.ERROR)
}

module.exports = Notimatica
