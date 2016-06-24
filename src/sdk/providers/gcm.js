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
    return navigator.serviceWorker.register('notimatica-sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        this.registration = registration
      })
  }

  /**
   * Get active subscription.
   *
   * @return {Promise}
   */
  getSubscription () {
    return this.registration.pushManager.getSubscription()
  }

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe () {
    return this.getSubscription()
      .then((subscription) => {
        if (!subscription) {
          return {
            existed: false,
            result: this.registration.pushManager.subscribe({ userVisibleOnly: true })
          }
        }

        return {
          existed: true,
          result: subscription
        }
      })
  }

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return this.getSubscription()
      .then((subscription) => {
        if (subscription) subscription.unsubscribe()
        return subscription
      })
  }
}

module.exports = provider
