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
      .then(navigator.serviceWorker.ready)
      .then((registration) => {
        this.registration = registration

        return this.registration.pushManager.getSubscription()
      })
  }

  /**
   * Register service worker.
   *
   * @return {Promise}
   */
  subscribe () {
    return this.ready()
      .then(() => this.registration.pushManager.subscribe({ userVisibleOnly: true }))
      .then((subscription) => {
        Notimatica.emit('subscribe:success', subscription.endpoint)

        return subscription.endpoint
      })
  }

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return this.ready()
      .then((subscription) => {
        if (subscription) {
          subscription.unsubscribe()
          this.registration.unregister()
        }

        return subscription
      })
  }

  /**
   * If user was subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.visitor.isSubscribed()
  }

  /**
   * If user was unsubscribed.
   *
   * @return {Promise}
   */
  wasUnsubscribed () {
    return this.visitor.wasUnsubscribed()
  }
}

module.exports = provider
