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
}

module.exports = provider
