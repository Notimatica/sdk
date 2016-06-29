import Driver from './driver'

import { subscribe, unsubscribe } from '../../api'
import { makeToken } from '../../utils'

module.exports = class Native extends Driver {
  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
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
      // Register in notimatica
      .then((subscription) => this._register(subscription))
      // Save token
      .then((token) => this.visitor.token(token))
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
    Notimatica.emit('unsibscribe:start')

    return this.provider.unsubscribe()
      .then((subscription) => this._unregister(subscription.endpoint))
      .then(() => {
        this.isSubscribed = false
        this.visitor.token(null)
        this.visitor.unsubscribe()
      })
      .then(() => Notimatica.emit('unsubscribe:success'))
      .catch((err) => Notimatica.emit('unsubscribe:fail', err))
  }

  /**
   * Subscribe to notifications.
   *
   * @param   {Object} subscription
   * @returns {Object}
   */
  _register (subscription) {
    const env = this.visitor.env
    const provider = this.provider.name
    const data = {
      provider: provider,
      token: makeToken(subscription.endpoint, provider),
      browser: env.browser,
      browser_version: env.browserMajorVersion,
      cookies: env.cookies,
      flash: env.flashVersion,
      mobile: env.mobile,
      os: env.os,
      os_version: env.osVersion,
      screen: env.screen,
      timezone: env.timezone,
      language: env.language
    }

    Notimatica.emit('register:start', data)

    return subscribe(this.options.project, data)
      .then((data) => {
        Notimatica.emit('register:success', data)

        return data.subscriber.token
      })
      .catch((err) => Notimatica.emit('register:fail', err))
  }

  /**
   * Delete subscription from notimatica.
   *
   * @param  {Object|null} subscription Subscription object
   * @return {Promise}
   */
  _unregister (subscription) {
    if (!subscription) return

    const data = {
      token: makeToken(subscription, this.provider.name)
    }

    Notimatica.emit('unregister:start', data)

    return unsubscribe(this.options.project, data)
      .then(() => Notimatica.emit('unregister:success'))
      .catch((err) => Notimatica.emit('unregister:fail', err))
  }
}
