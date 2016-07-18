import env from './env'
import Storage from './storage'
import { UUID_STORAGE_NAME, UNSUBSCRIBED_STORAGE_NAME } from './defaults'

module.exports = class Visitor {
  /**
   * Constructor
   */
  constructor () {
    this.env = env
    this.storage = new Storage(this.env.localStorage)
  }

  /**
   * Get user ID.
   *
   * @return {Promise}
   */
  uuid (uuid) {
    if (uuid) {
      return this.storage.set(UUID_STORAGE_NAME, uuid)
    }

    if (typeof uuid === 'undefined') {
      return this.storage.get(UUID_STORAGE_NAME)
    }

    if (uuid === null) {
      return this.storage.delete(UUID_STORAGE_NAME)
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
    return this.storage.get(UNSUBSCRIBED_STORAGE_NAME)
      .then((value) => !!value)
  }

  /**
   * Unsubscribe visitor.
   *
   * @param  {Null} value Action.
   * @return {Promise}
   */
  unsubscribe (value) {
    if (typeof value === 'undefined') {
      return this.storage.set(UNSUBSCRIBED_STORAGE_NAME, 1)
    }

    if (value === null) {
      return this.storage.delete(UNSUBSCRIBED_STORAGE_NAME)
    }
  }
}
