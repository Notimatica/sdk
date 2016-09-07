import AbstractDriver from './abstract'

import { subscribe, unsubscribe } from '../../api'
import { makeToken } from '../../utils'

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
      Notimatica.on('provider:subscription-received', (subscription) => {
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
      Notimatica.on('provider:subscription-removed', () => {
        resolve()
      })

      this.provider.unsubscribe()
    })
      .then(() => this.unregister())
  }

  /**
   * Register subscriber.
   *
   * @param  {String} subscription The subscription
   * @return {Promise}
   */
  register (subscription) {
    return this._register(subscription)
      .then((uuid) => this._finishRegistration(uuid))
  }

  /**
   * Unregister user from Notimatica.
   *
   * @return {Promise}
   */
  unregister () {
    return Notimatica.visitor.uuid()
      .then((uuid) => this._unregister(uuid))
      .then(() => this._finishUnregistration())
  }

  /**
   * Call notimatica API to register subscriber.
   *
   * @param   {Object} subscription
   * @returns {Promise}
   */
  _register (subscription) {
    const env = Notimatica.visitor.env
    const provider = this.provider.name
    const data = {
      provider: provider,
      token: makeToken(subscription, provider),
      browser: env.browser,
      browser_version: env.browserMajorVersion,
      cookies: env.cookies,
      flash: env.flashVersion,
      mobile: env.mobile,
      os: env.os,
      os_version: env.osVersion,
      screen: env.screen,
      timezone: env.timezone,
      language: env.language,
      tags: this.options.tags
    }

    Notimatica.emit('register:start', data)

    return subscribe(this.options.project, data)
      .then((data) => {
        Notimatica.emit('register:success', data)

        return data.subscriber.uuid
      })
      .catch((err) => {
        Notimatica.emit('register:fail', err)
        throw new Error('Registration failed.')
      })
  }

  /**
   * Delete subscription from notimatica.
   *
   * @param  {Object|null} uuid Subscriber's notimatica uuid
   * @return {Promise}
   */
  _unregister (uuid) {
    if (!uuid) return

    const data = {
      uuid
    }

    Notimatica.emit('unregister:start', data)

    return unsubscribe(this.options.project, data)
      .then(() => {
        Notimatica.emit('unregister:success')
      })
      .catch((err) => {
        Notimatica.emit('unregister:fail', err)
        throw new Error('Failed to unregister.')
      })
  }
}
