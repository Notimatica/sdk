import { merge } from '../utils'

module.exports = class AbstractPlugin {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor () {
    this.options = {}

    Notimatica.emit('plugin:ready', this)
  }

  /**
   * Prepare to init.
   *
   * @return {Promise}
   */
  prepare () {
    return new Promise(function (resolve) { resolve() })
  }

  /**
   * Ready.
   *
   * @return {Promise}
   */
  init (options) {
    this.options = merge(this.defaults, options)

    if (this.options.autorun) {
      this.prepare().then(() => this.play())
    }
  }
}
