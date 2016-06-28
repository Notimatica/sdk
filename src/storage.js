module.exports = class Storage {
  /**
   * Constructor
   *
   * @param {Boolean} localStorage LocaStorage can be used.
   */
  constructor (localStorage) {
    this.localStorage = localStorage
  }

  /**
   * Set key - value.
   *
   * @param  {String} key   The key.
   * @param  {String} value The value.
   * @return {Promise}
   */
  set (key, value) {
    return this.localStorage ? this._setInStorage(key, value) : this._setCookie(key, value)
  }

  /**
   * Get value by key.
   *
   * @param  {String} key      The key.
   * @param  {String} _default The default value.
   * @return {Promise}
   */
  get (key, _default = null) {
    return (this.localStorage ? this._getInStorage(key) : this._getCookie(key))
      .then((value) => value || _default)
  }

  /**
   * Delete key.
   *
   * @param  {String} key The key.
   * @return {Promise}
   */
  delete (key) {
    return this.localStorage ? this._deleteFromStorage(key) : this._deleteCookie(key)
  }

  /**
   * Set value in localStorage.
   *
   * @param  {String} key   The key.
   * @param  {String} value The value.
   * @return {Promise}
   */
  _setInStorage (key, value) {
    return new Promise(function (resolve, reject) {
      resolve(localStorage.setItem(key, value))
    })
  }

  /**
   * Get value by key from localStorage.
   *
   * @param  {String} key The key.
   * @return {String}
   */
  _getInStorage (key) {
    return new Promise(function (resolve, reject) {
      resolve(localStorage.getItem(key))
    })
  }

  /**
   * Get value by key from localStorage.
   *
   * @param  {String} key The key.
   * @return {String}
   */
  _deleteFromStorage (key) {
    return new Promise(function (resolve, reject) {
      resolve(localStorage.removeItem(key))
    })
  }

  /**
   * Set value in localStorage.
   *
   * @param  {String} key   The key.
   * @param  {String} value The value.
   * @return {Promise}
   */
  _setCookie (key, value) {
    return new Promise(function (resolve, reject) {
      resolve(this._createCookie(key, value, 365))
    })
  }

  /**
   * Get value by key from localStorage.
   *
   * @param  {String} key The key.
   * @return {String}
   */
  _getCookie (key) {
    return new Promise(function (resolve, reject) {
      resolve(this._readCookie(key))
    })
  }

  /**
   * Get value by key from localStorage.
   *
   * @param  {String} key The key.
   * @return {String}
   */
  _deleteCookie (key) {
    return new Promise(function (resolve, reject) {
      resolve(this._eraseCookie(key))
    })
  }

  /**
   * Helper create cookie.
   *
   * @param  {String} name  The name.
   * @param  {String} value The value.
   * @param  {Integer} days  The number of days to live.
   */
  _createCookie (name, value, days) {
    let expires = ''
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + (days * 86400))
      expires = `; expires=${date.toUTCString()}`
    }

    document.cookie = `${name}=${value}${expires}; path=/`
  }

  /**
   * Helper read cookie.
   *
   * @param  {String} name The name.
   * @return {String}
   */
  _readCookie (name) {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')

    for (var i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }

    return null
  }

  /**
   * Helper erase cookie.
   *
   * @param  {String} name The name.
   */
  _eraseCookie (name) {
    this._createCookie(name, '', -1)
  }
}
