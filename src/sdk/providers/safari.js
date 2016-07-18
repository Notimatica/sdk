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
            this.emit('subscribe:success', permissionData.deviceToken)
            break
          default:
            Notimatica.emit('subscribe:fail', 'Safari denied to send notification')
            break
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
        permissionData.permission === 'granted'
          ? Promise.resolve()
          : Promise.reject()
      })
  }

  /**
   * If user was subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.ready()
      .then((permissionData) => permissionData.permission === 'granted')
  }

  /**
   * If user was unsubscribed.
   *
   * @return {Promise}
   */
  wasUnsubscribed () {
    const permission = this.ready()
      .then((permissionData) => permissionData.permission === 'denied')

    const visitor = this.visitor.wasUnsubscribed()

    return Promise.all([permission, visitor])
      .then((values) => {
        return values[0] || values[1]
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

        this.emit('subscribe:success', permissionData.deviceToken)
      }
    )
  }
}

module.exports = provider
