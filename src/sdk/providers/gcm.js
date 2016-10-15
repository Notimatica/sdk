import AbstractProvider from './abstract'

const provider = class Gcm extends AbstractProvider {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return 'gcm'
  }

  /**
   * If push supported.
   *
   * @return {Boolean}
   */
  pushSupported () {
    return 'serviceWorker' in navigator
  }

  /**
   * Service worker ready.
   *
   * @return {Promise}
   */
  ready () {
    return navigator.serviceWorker.register('/notimatica-sw.js')
      .then(() => navigator.serviceWorker.ready)
      .catch(() => {
        throw new Error('Seams like notimatica-sw.js or manifest.json file is missing.')
      })
  }

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe () {
    return this.ready()
      .then((registration) => registration.pushManager.subscribe({ userVisibleOnly: true }))
      .then((subscription) => subscription.endpoint)
      .then((endpoint) => Notimatica.emit('provider:subscribed', endpoint))
      .catch(() => {
        Notimatica.emit('subscribe:cancel')
      })
  }

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return this.ready()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (subscription) subscription.unsubscribe()
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
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => !!subscription)
  }

  /**
   * Get subscription token.
   *
   * @return {Promise}
   */
  getToken () {
    return this.ready()
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => subscription ? subscription.endpoint : null)
  }
}

module.exports = provider
