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
      Notimatica.on('provider:subscription-received', (uuid) => {
        resolve(uuid)
      })

      setTimeout(() => {
        Notimatica.emit('provider:subscription-received', 'dummy-long-subscriber-uuid')
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
      Notimatica.on('provider:subscription-removed', () => {
        resolve()
      })

      setTimeout(() => {
        Notimatica.emit('provider:subscription-removed')
      }, 2000)
    })
      .then(() => this._finishUnregistration())
  }
}
