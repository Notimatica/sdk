import AbstractDriver from './abstract'

module.exports = class Emulate extends AbstractDriver {

  /**
   * Driver name.
   *
   * @return {String}
   */
  get name () {
    return 'emulate'
  }

  /**
   * Prepare driver.
   *
   * @return {Promise}
   */
  prepare () {
    return Notimatica.visitor.uuid()
      .then((uuid) => {
        if (uuid) this.isSubscribed = true
      })
      .then(() => Notimatica.emit('driver:ready', this))
  }

  /**
   * Subscribe for https sites using native sdk.
   *
   * @return {Promise}
   */
  subscribe () {
    if (!this.silent) Notimatica.emit('subscribe:start')

    return this._finishSubscription('dummy-long-subscriber-uuid')
  }

  /**
   * Unsubscribe.
   *
   * @return {Promise}
   */
  unsubscribe () {
    if (!this.silent) Notimatica.emit('unsubscribe:start')

    return this._finishUnsubscription()
  }
}
