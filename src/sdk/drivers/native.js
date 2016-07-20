import AbstractDriver from './abstract'

import { subscribe, unsubscribe } from '../../api'
import { makeToken } from '../../utils'

module.exports = class Native extends AbstractDriver {
  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
    Notimatica.on('subscribe:subscription-received', (subscription) => {
      this.register(subscription)
    })

    return this.provider.ready()
      .then(() => super.ready())
  }

  /**
   * Subscribe for https sites using native sdk.
   *
   * @return {Promise}
   */
  subscribe () {
    Notimatica.emit('subscribe:start')

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
      // Save token
      .then((token) => this.visitor.uuid(token))
      // Emit success event
      .then((token) => {
        this.isSubscribed = true
        Notimatica.emit('subscribe:success', token)

        return this.visitor.unsubscribe(null)
      })
      .catch((err) => Notimatica.emit('subscribe:fail', err))
  }

  /**
   * Unsubscribe.
   *
   * @return {Promise}
   */
  unsubscribe () {
    Notimatica.emit('unsubscribe:start')

    return this.provider.unsubscribe()
      .then(() => this.visitor.uuid())
      .then((token) => this._unregister(token))
      .then(() => {
        this.isSubscribed = false
        this.visitor.uuid(null)
        this.visitor.unsubscribe()
      })
      .then(() => Notimatica.emit('unsubscribe:success'))
      .catch((err) => Notimatica.emit('unsubscribe:fail', err))
  }

  /**
   * Call notimatica API to register subscriber.
   *
   * @param   {Object} subscription
   * @returns {Object}
   */
  _register (subscription) {
    const env = this.visitor.env
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
      .then(() => Notimatica.emit('unregister:success'))
      .catch((err) => {
        Notimatica.emit('unregister:fail', err)
        throw new Error('Failed to unregister.')
      })
  }
}
