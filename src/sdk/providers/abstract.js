const provider = class AbstractProvider {
  /**
   * Constructor.
   *
   * @param  {Object} options Options map
   */
  constructor (options) {
    this.options = options
  }

  /**
   * If push supported.
   *
   * @return {Boolean}
   */
  pushSupported () {
    return false
  }

  /**
   * If user is subscribed.
   *
   * @return {Promise}
   */
  isSubscribed () {
    return Promise.resolve(false)
  }

  /**
   * Get subscription token.
   *
   * @return {Promise}
   */
  getToken () {
    return Promise.resolve(null)
  }
}

module.exports = provider
