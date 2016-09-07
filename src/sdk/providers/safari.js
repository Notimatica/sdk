require('whatwg-fetch')

import AbstractProvider from './abstract'
import { PROVIDER_SAFARI, API_URL } from '../../defaults'

const provider = class Safari extends AbstractProvider {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return PROVIDER_SAFARI
  }

  /**
   * If push supported.
   *
   * @return {Boolean}
   */
  pushSupported () {
    if (!this.options.safariWebId) {
      if (this.options.debug) {
        Notimatica.emit('warning', 'Safari is unsupported due to lack of safariWebId in Notimatica options.')
      }

      return false
    }

    return 'safari' in window && 'pushNotification' in window.safari
  }

  /**
   * Service worker ready.
   *
   * @return {Promise}
   */
  ready () {
    return new Promise((resolve) => {
      this.permissionData = window.safari.pushNotification.permission(this.options.safariWebId)

      // If Safari is subscribed, but Notimatica registration is absent, show user a message.
      Notimatica.on('ready', () => {
        Notimatica.visitor.isSubscribed().then((notimaticaSubscribed) => {
          if (this.permissionData.permission === 'granted' && !notimaticaSubscribed) {
            this._showUnsubscribeMessage()
          }
        })
      })

      resolve(this.permissionData)
    })
  }

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe () {
    return this.ready()
      .then((permissionData) => {
        switch (permissionData.permission) {
          case 'default':
            this._requestPermission()
            break
          case 'granted':
            Notimatica.emit('provider:subscription-received', permissionData.deviceToken)
            break
          default:
            throw new Error('Safari denied to send notification')
        }
      })
  }

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return this.ready()
      .then((permissionData) => {
        this._showUnsubscribeMessage(permissionData)
      })
      .then(() => Notimatica.emit('provider:subscription-removed'))
  }

  /**
   * If user is subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.ready()
      .then((permissionData) => {
        return permissionData.permission === 'granted' && Notimatica.visitor.isSubscribed()
      })
  }

  /**
   * Get subscription token.
   *
   * @return {Promise}
   */
  getToken () {
    return this.ready()
      .then((permissionData) => {
        return permissionData.permission === 'granted' ? permissionData.deviceToken : null
      })
  }

  /**
   * Helper to request permission to subscribe.
   */
  _requestPermission () {
    window.safari.pushNotification.requestPermission(
      `${API_URL}/v1/projects/${this.options.project}/safari`, // The web service URL.
      this.options.safariWebId,
      {},
      (permissionData) => {
        Notimatica.emit('debug', 'Safari permission request result', permissionData)

        if (!permissionData.deviceToken || permissionData.permission !== 'granted') {
          throw new Error('Subcription was empty.')
        }

        Notimatica.emit('provider:subscription-received', permissionData.deviceToken)
      }
    )
  }

  /**
   * Show remove from preferences message if user is unregistered,
   * but Safari is still subscribed to notifications.
   */
  _showUnsubscribeMessage (permissionData) {
    Notimatica.emit(
      'user:interact',
      'You are unsubscribed',
      'Now you can open Safari notifications preferences and remove this site from the list.'
    )
  }
}

module.exports = provider
