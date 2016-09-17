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
    return Notimatica.visitor.getUuid()
      .then((uuid) => {
        this.isSubscribed = !!uuid
      })
      .then(() => Notimatica.emit('driver:ready', this))
  }

  /**
   * Subscribe.
   *
   * @return {Promise}
   */
  subscribe () {
    return new Promise((resolve, reject) => {
      Notimatica.on('provider:subscribed', (uuid) => {
        resolve(uuid)
      })

      setTimeout(() => {
        Notimatica.emit('provider:subscribed', 'dummy-long-subscriber-uuid')
      }, 2000)
    })
      .then((uuid) => this._finishRegistration(uuid))
  }

  /**
   * Unsubscribe.
   *
   * @return {Promise}
   */
  unsubscribe () {
    return new Promise((resolve, reject) => {
      Notimatica.on('provider:unsubscribed', () => {
        resolve()
      })

      setTimeout(() => {
        Notimatica.emit('provider:unsubscribed')
      }, 2000)
    })
      .then(() => this._finishUnregistration())
  }
}
