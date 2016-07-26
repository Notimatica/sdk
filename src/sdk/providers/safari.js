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
            Notimatica.emit('subscribe:success', permissionData.deviceToken)
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
        if (permissionData.permission === 'granted') {
          Notimatica.emit(
            'popover:show',
            'You are unsubscribed',
            'Now you can open notifications preferences and remove this site from the list.'
          )

          Promise.resolve()
        } else {
          Promise.reject()
        }
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

    const visitor = Notimatica.visitor.wasUnsubscribed()

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

        Notimatica.emit('subscribe:subscription-received', permissionData.deviceToken)
      }
    )
  }
}

module.exports = provider
