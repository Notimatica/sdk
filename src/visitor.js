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
   * Get subscriber ID.
   *
   * @return {Promise}
   */
  uuid (uuid) {
    switch (true) {
      case uuid === undefined: // Retrieve uuid
        return (this._uuid !== undefined)
          ? Promise.resolve(this._uuid)
          : this.storage.get('key_value', 'subscriber')
              .then((value) => (value) ? value.value : null)
              .then((uuid) => {
                this._uuid = uuid
                return uuid
              })
      case uuid === null: // Unset uuid
        return this.storage.remove('key_value', 'subscriber')
      default: // Set uuid
        this._uuid = uuid
        return this.storage.set('key_value', { key: 'subscriber', value: uuid })
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
}
