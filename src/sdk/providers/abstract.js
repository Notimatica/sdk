const provider = class AbstractProvider {
  /**
   * Constructor.
   *
   * @param  {Object} options Options map
   */
  constructor (options, visitor) {
    this.options = options
    this.visitor = visitor
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
