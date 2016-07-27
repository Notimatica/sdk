import { PROVIDER_CHROME, PROVIDER_FIREFOX, PROVIDER_SAFARI, PROVIDER_UNKNOWN } from '../../defaults'

module.exports = class AbstractDriver {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor (options) {
    this.options = options

    this._prepareProvider()

    Notimatica.emit('driver:ready', this)
  }

  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
    let ready = {
      isSubscribed: false,
      wasUnsubscribed: false
    }

    return this.provider.isSubscribed()
      .then((isSubscribed) => {
        this.isSubscribed = isSubscribed
        ready.isSubscribed = isSubscribed

        return this.provider.wasUnsubscribed()
      })
      .then((wasUnsubscribed) => {
        this.wasUnsubscribed = wasUnsubscribed
        ready.wasUnsubscribed = wasUnsubscribed

        return ready
      })
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
    this.wasUnsubscribed = false

    return Promise.all([
      Notimatica.visitor.uuid(uuid),
      Notimatica.visitor.unsubscribe(null)
    ])
    .then((uuid) => Notimatica.emit('subscribe:success', uuid))
  }

  /**
   * As well as subscription removed and user unregistered from Notimatica,
   * finish unsubscribtion process.
   *
   * @return {Promise}
   */
  _finishUnsubscription () {
    this.isSubscribed = false
    this.wasUnsubscribed = true

    return Promise.all([
      Notimatica.visitor.uuid(null),
      Notimatica.visitor.unsubscribe()
    ])
    .then(() => Notimatica.emit('unsubscribe:success'))
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
