import env from './env'
import Storage from './storage'

module.exports = class Visitor {
  /**
   * Constructor.
   */
  constructor () {
    this.env = window ? env : {}
    this.storage = Storage
    this.uuid = null
  }

  /**
   * If user is subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return this.getUuid()
      .then((uuid) => !!uuid)
  }

  /**
   * Set subscriber UUID.
   *
   * @param  {String} uuid The uuid
   * @return {Promise}
   */
  setUuid (uuid) {
    this.uuid = uuid

    return this.storage.set('key_value', { key: 'subscriber', value: uuid })
  }

  /**
   * Get subscriber UUID.
   *
   * @return {Promise}
   */
  getUuid () {
    if (this.uuid !== null) Promise.resolve(this.uuid)

    return this.storage.get('key_value', 'subscriber')
      .then((value) => {
        if (value) {
          this.uuid = value.value
        }

        return this.uuid
      })
  }

  /**
   * Delete subscriber UUID.
   *
   * @return {Promise}
   */
  deleteUuid () {
    return this.storage.remove('key_value', 'subscriber')
  }

  /**
   * Set subscriber token.
   *
   * @param  {String} token The token
   * @return {Promise}
   */
  setToken (token) {
    return this.storage.set('key_value', { key: 'token', value: token })
  }

  /**
   * Get subscriber token.
   *
   * @return {Promise}
   */
  getToken () {
    return this.storage.get('key_value', 'token')
      .then((value) => {
        if (value) {
          return value.value
        }

        return null
      })
  }

  /**
   * Delete subscriber token.
   *
   * @return {Promise}
   */
  deleteToken () {
    return this.storage.remove('key_value', 'token')
  }

  /**
   * Set extra visitor info.
   *
   * @param  {Object} extra The extra info
   * @return {Promise}
   */
  setExtra (extra) {
    return this.needUpdateExtra(extra)
      .then((update) => {
        if (update) {
          return this.storage.set('key_value', { key: 'extra', value: extra })
            .then(() => true)
        }

        return false
      })
  }

  /**
   * If we need to update extra info.
   *
   * @param  {Object} extra The extra info
   * @return {Promise}
   */
  needUpdateExtra (extra) {
    return this.storage.get('key_value', 'extra')
      .then((value) => {
        return (value === undefined || JSON.stringify(value.value) !== JSON.stringify(extra))
      })
  }
}
