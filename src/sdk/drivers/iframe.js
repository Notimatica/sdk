import EmulateDriver from './emulate'

module.exports = class Iframe extends EmulateDriver {

  /**
   * Driver name.
   *
   * @return {String}
   */
  get name () {
    return 'iframe'
  }

  /**
   * Prepare driver.
   *
   * @return {Promise}
   */
  prepare () {
    Notimatica.on('visitor:set-extra', () => {
      if (this.isSubscribed) {
        Notimatica.visitor.getToken()
          .then((token) => this._register(token))
      }
    })

    return super.prepare()
  }
}
