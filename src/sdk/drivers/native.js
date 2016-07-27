import AbstractDriver from './abstract'

import { subscribe, unsubscribe } from '../../api'
import { makeToken } from '../../utils'

module.exports = class Native extends AbstractDriver {
  /**
   * Prepare driver.
   */
  prepare () {
    Notimatica.on('subscribe:subscription-received', (subscription) => {
      this.register(subscription)
    })

    Notimatica.on('subscribe:subscription-removed', () => {
      this.unregister()
    })

    return Promise.all([
      this.provider.isSubscribed(),
      Notimatica.visitor.isSubscribed()
    ])
      .then(([ providerSubscribed, notimaticaSubscribed ]) => {
        if (providerSubscribed) {
          if (!notimaticaSubscribed) {
            this.silent = true
            this.subscribe()
          }

          this.isSubscribed = true
        } else {
          if (notimaticaSubscribed) {
            this.silent = true
            this.unsubscribe()
          }

          this.isSubscribed = false
        }

        return this.isSubscribed
      })
  }

  /**
   * Subscribe for https sites using native sdk.
   *
   * @return {Promise}
   */
  subscribe () {
    if (!this.silent) Notimatica.emit('subscribe:start')

    return this.provider.subscribe()
  }

  /**
   * Register subscriber.
   *
   * @param  {String} subscription The subscription
   * @return {Promise}
   */
  register (subscription) {
    return this._register(subscription)
      .then((uuid) => this._finishSubscription(uuid))
      .catch((err) => {
        if (!this.silent) Notimatica.emit('subscribe:fail', err)
      })
  }

  /**
   * Unsubscribe.
   *
   * @return {Promise}
   */
  unsubscribe () {
    if (!this.silent) Notimatica.emit('unsubscribe:start')

    return this.provider.unsubscribe()
  }

  /**
   * Unregister user from Notimatica.
   *
   * @return {Promise}
   */
  unregister () {
    return Notimatica.visitor.uuid()
      .then((uuid) => this._unregister(uuid))
      .then(() => this._finishUnsubscription())
      .catch((err) => {
        if (!this.silent) Notimatica.emit('unsubscribe:fail', err)
      })
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

    if (!this.silent) Notimatica.emit('register:start', data)

    return subscribe(this.options.project, data)
      .then((data) => {
        if (!this.silent) Notimatica.emit('register:success', data)

        return data.subscriber.uuid
      })
      .catch((err) => {
        if (!this.silent) Notimatica.emit('register:fail', err)
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

    if (!this.silent) Notimatica.emit('unregister:start', data)

    return unsubscribe(this.options.project, data)
      .then(() => {
        if (!this.silent) Notimatica.emit('unregister:success')
      })
      .catch((err) => {
        if (!this.silent) Notimatica.emit('unregister:fail', err)
        throw new Error('Failed to unregister.')
      })
  }
}
