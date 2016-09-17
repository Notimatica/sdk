import { makeToken } from '../../utils'
import { subscribe, unsubscribe } from '../../api'
import { PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../../defaults'

module.exports = class AbstractDriver {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor (options) {
    this.options = options
    this.isSubscribed = false

    this._prepareProvider()
  }

  /**
   * Prepare driver.
   *
   * @return {Promise}
   */
  prepare () {
    return Promise.resolve(Notimatica.emit('driver:ready', this))
  }

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported () {
    return this.provider.pushSupported()
  }

  /**
   * As well as Notimatica subscriber uuid obtained,
   * finish subscription process.
   *
   * @param  {String} uuid The uuid
   * @return {Promise}
   */
  _finishRegistration (uuid) {
    this.isSubscribed = true

    return Notimatica.visitor.setUuid(uuid)
      .then((data) => data.value)
  }

  /**
   * As well as subscription removed and user unregistered from Notimatica,
   * finish unsubscribtion process.
   *
   * @return {Promise}
   */
  _finishUnregistration () {
    this.isSubscribed = false

    return Notimatica.visitor.deleteUuid()
  }

  /**
   * Detect provider from browser.
   */
  _prepareProvider () {
    let provider
    switch (Notimatica.visitor.env.browser) {
      case 'Chrome':
        provider = PROVIDER_CHROME
        break
      case 'Firefox':
        provider = PROVIDER_FIREFOX
        break
      case 'Safari':
        provider = PROVIDER_SAFARI
        break
      default:
        provider = PROVIDER_UNKNOWN
        break
    }

    const Provider = require('../providers/' + provider)
    this.provider = new Provider(this.options)
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
      extra: this.options.extra
    }

    Notimatica.emit('register:start', data)

    return subscribe(this.options.project, data)
      .then((data) => {
        Notimatica.emit('register:success', data)

        return data.subscriber.uuid
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
  }
}
