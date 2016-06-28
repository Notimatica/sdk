import env from './env'
import Storage from './storage'
import { TOKEN_STORAGE_NAME, UNSUBSCRIBED_STORAGE_NAME } from './defaults'

module.exports = class Visitor {
  /**
   * Constructor
   */
  constructor () {
    this.info = env
    this.storage = new Storage(this.info.localStorage)
  }

  /**
   * Get browser name.
   *
   * @return {String}
   */
  get browser () {
    return this.info.browser
  }

  /**
   * Get user ID.
   *
   * @return {Promise}
   */
  token (token) {
    if (token) {
      return this.storage.set(TOKEN_STORAGE_NAME, token)
    }

    if (typeof token === 'undefined') {
      return this.storage.get(TOKEN_STORAGE_NAME)
    }

    if (token === null) {
      return this.storage.delete(TOKEN_STORAGE_NAME)
    }
  }

  /**
   * If user was unsubscribed.
   *
   * @return {Promise}
   */
  wasUnsubscribed () {
    return this.storage.get(UNSUBSCRIBED_STORAGE_NAME)
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
