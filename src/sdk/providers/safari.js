require('whatwg-fetch')

import AbstractProvider from './abstract'
import { PROVIDER_SAFARI, PROVIDERS_ENDPOINTS } from '../../defaults'
import { t } from '../../utils'

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
            Notimatica.emit('provider:subscribed', permissionData.deviceToken)
            break
          default:
            Notimatica.emit('subscribe:cancel')
            this._showIsUnsubscribedMessage()
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
      .then(() => Notimatica.emit('provider:unsubscribed'))
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
    const url = PROVIDERS_ENDPOINTS[PROVIDER_SAFARI].replace('%', this.options.project)

    window.safari.pushNotification.requestPermission(
      url, // The web service URL.
      this.options.safariWebId,
      {},
      (permissionData) => {
        Notimatica.emit('debug', 'Safari permission request result', permissionData)

        if (!permissionData.deviceToken || permissionData.permission !== 'granted') {
          return Notimatica.emit('subscribe:cancel')
        }

        Notimatica.emit('provider:subscribed', permissionData.deviceToken)
      }
    )
  }

  /**
   * Show remove from preferences message if user is unregistered,
   * but Safari is still subscribed to notifications.
   */
  _showIsUnsubscribedMessage () {
    Notimatica.emit(
      'user:interact',
      t('message.safari.is_unsubscribed.title'),
      t('message.safari.is_unsubscribed.body')
    )
  }

  /**
   * Show remove from preferences message if user is unregistered,
   * but Safari is still subscribed to notifications.
   */
  _showUnsubscribeMessage () {
    Notimatica.emit(
      'user:interact',
      t('message.safari.unsubscribed.title'),
      t('message.safari.unsubscribed.body')
    )
  }
}

module.exports = provider
