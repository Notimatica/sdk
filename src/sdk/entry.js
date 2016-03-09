import * as utils from '../utils'
import * as api from '../api'
import log from 'loglevel'

const Notimatica = function (options) {
  this.options = {}

  this._inited = false
  this._api = api

  utils.merge(this.options, options)
}

Notimatica.prototype.init = function () {
  if (this._inited) {
    return log.warn('SDK was already inited')
  }

  if (this.pushSupported()) {
    // this.register()
  }

  this._inited = true
  log.info('SDK inited with', this.options)
}

Notimatica.prototype.pushSupported = function () {
  return 'serviceWorker' in navigator
}

Notimatica.prototype.subscribe = function (registration) {
  registration.pushManager.subscribe({ userVisibleOnly: true })
    .then((subscription) => {
      this._api.subscribe(subscription.endpoint).catch((res) => {
        console.log(res)
      })
    })
}

Notimatica.prototype.register = function () {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      registration.addEventListener('updatefound', updateFound)
      return registration
    })
      .then((registration) => {
        return registration.pushManager.getSubscription()
          .then((subscription) => {
            if (subscription) {
              return subscription
            }

            return this.subscribe(registration)
          })
      })
}

const updateFound = function () {
  var installingWorker = this.installing

  // Wait for the new service worker to be installed before prompting to update.
  installingWorker.addEventListener('statechange', () => {
    switch (installingWorker.state) {
      case 'installed':
        log.info('Installed', installingWorker)
        // Only show the prompt if there is currently a controller so it is not
        // shown on first load.
        if (navigator.serviceWorker.controller &&
          window.confirm('An updated version of this page is available, would you like to update?')) {
          window.location.reload()
          return
        }
        break

      case 'redundant':
        log.error('The installing service worker became redundant.')
        break
    }
  })
}

module.exports = Notimatica
