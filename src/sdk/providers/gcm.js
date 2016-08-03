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
      .then((subscription) => subscription.endpoint)
      .then((endpoint) => Notimatica.emit('subscribe:subscription-received', endpoint))
  }

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    return this.ready()
      .then((subscription) => {
        if (subscription) subscription.unsubscribe()
      })
      .then(() => this.registration.unregister())
      .then(() => Notimatica.emit('subscribe:subscription-removed'))
  }

  /**
   * If user was subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.ready()
      .then((subscription) => !!subscription)
  }
}

module.exports = provider
