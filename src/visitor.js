import env from './env'
import Storage from './storage'

module.exports = class Visitor {
  /**
   * Constructor.
   */
  constructor () {
    this.env = window ? env : {}
    this.storage = Storage
  }

  /**
   * Get user ID.
   *
   * @return {Promise}
   */
  uuid (uuid) {
    if (uuid) {
      return this.storage.set('key_value', { key: 'subscriber', value: uuid })
    }

    if (typeof uuid === 'undefined') {
      return this.storage.get('key_value', 'subscriber')
        .then((value) => (value) ? value.value : null)
    }

    if (uuid === null) {
      return this.storage.remove('key_value', 'subscriber')
    }
  }

  /**
   * If user is subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.uuid()
      .then((uuid) => !!uuid)
  }

  /**
   * If user was unsubscribed.
   *
   * @return {Promise}
   */
  wasUnsubscribed () {
    return this.storage.get('key_value', 'unsubscribed')
      .then((value) => (value) ? !!value.value : false)
  }

  /**
   * Unsubscribe visitor.
   *
   * @param  {Null} value Action.
   * @return {Promise}
   */
  unsubscribe (value) {
    if (typeof value === 'undefined') {
      return this.storage.set('key_value', { key: 'unsubscribed', value: 1 })
    }

    if (value === null) {
      return this.storage.remove('key_value', 'unsubscribed')
    }
  }
}
