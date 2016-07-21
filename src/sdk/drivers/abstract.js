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

    Notimatica.emit('driver:create', this)
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
