import { PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../../defaults'

module.exports = class AbstractDriver {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor (options) {
    this.options = options
    this.silent = false

    this._prepareProvider()
  }

  /**
   * Prepare driver.
   */
  prepare () {
    Notimatica.emit('driver:ready', this)
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
  _finishSubscription (uuid) {
    this.isSubscribed = true

    return Notimatica.visitor.uuid(uuid)
      .then(() => {
        if (!this.silent) Notimatica.emit('subscribe:success', uuid)
        this.silent = false
      })
  }

  /**
   * As well as subscription removed and user unregistered from Notimatica,
   * finish unsubscribtion process.
   *
   * @return {Promise}
   */
  _finishUnsubscription () {
    this.isSubscribed = false

    return Notimatica.visitor.uuid(null)
      .then(() => {
        if (!this.silent) Notimatica.emit('unsubscribe:success')
        this.silent = false
      })
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
}
