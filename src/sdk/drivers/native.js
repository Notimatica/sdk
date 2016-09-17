import AbstractDriver from './abstract'

module.exports = class Native extends AbstractDriver {
  /**
   * Driver name.
   *
   * @return {String}
   */
  get name () {
    return 'native'
  }

  /**
   * Prepare driver.
   *
   * @return {Promise}
   */
  prepare () {
    Notimatica.on('visitor:set-extra', () => {
      if (this.isSubscribed) {
        this.provider.getToken()
          .then((token) => this.register(token))
      }
    })

    return Promise.all([
      this.provider.isSubscribed(),
      Notimatica.visitor.isSubscribed()
    ])
      .then(([ providerSubscribed, notimaticaSubscribed ]) => {
        switch (true) {
          case providerSubscribed && !notimaticaSubscribed: // browser subscribed, sdk not - fullfill it
            return this.provider.getToken()
              .then((token) => this.register(token))
          case !providerSubscribed && notimaticaSubscribed: // browser unsubscribed, sdk is - unregister
            return this.unregister()
          default:
            return providerSubscribed && notimaticaSubscribed
        }
      })
      .then((uuid) => {
        this.isSubscribed = !!uuid
        Notimatica.emit('driver:ready', this)
      })
  }

  /**
   * Subscribe for https sites using native sdk.
   *
   * @return {Promise}
   */
  subscribe () {
    return new Promise((resolve) => {
      Notimatica.on('provider:subscribed', (subscription) => {
        resolve(subscription)
      })

      this.provider.subscribe()
    })
      .then((subscription) => this.register(subscription))
  }

  /**
   * Unsubscribe.
   *
   * @return {Promise}
   */
  unsubscribe () {
    return new Promise((resolve) => {
      Notimatica.on('provider:unsubscribed', () => {
        resolve()
      })

      this.provider.unsubscribe()
    })
      .then(() => this.unregister())
  }

  /**
   * Register subscriber.
   *
   * @param  {String} token The subscription token
   * @return {Promise}
   */
  register (subscription) {
    return Notimatica.visitor.setToken(subscription)
      .then(() => this._register(subscription))
      .then((uuid) => this._finishRegistration(uuid))
      .catch((err) => {
        Notimatica.emit('register:fail', err)

        return this.provider.unsubscribe()
          .then(() => {
            throw new Error('Registration failed.')
          })
      })
  }

  /**
   * Unregister user from Notimatica.
   *
   * @return {Promise}
   */
  unregister () {
    return Notimatica.visitor.deleteToken()
      .then(() => Notimatica.visitor.getUuid())
      .then((uuid) => this._unregister(uuid))
      .then(() => this._finishUnregistration())
      .catch((err) => {
        Notimatica.emit('unregister:fail', err)
        throw new Error('Failed to unregister.')
      })
  }
}
