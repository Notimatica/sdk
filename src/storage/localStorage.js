export default class LocalStorage {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor (options) {
    this.options = options
  }

  /**
   * Get table key.
   *
   * @param  {String} table The table name
   * @return {String}
   */
  _key (table) {
    for (var i = 0; i < this.options.tables.length; i++) {
      if (this.options.tables[i].name === table) return this.options.tables[i].key
    }

    throw new Error(`Undefined table '${table}'`)
  }

  /**
   * Set value to the table.
   *
   * @param  {String} table The table name
   * @param  {Object} value The value
   * @return {Promise}
   */
  set (table, value) {
    const key = this._key()

    return new Promise((resolve, reject) => {
      const stored = JSON.parse(localStorage.getItem(table)) || []
      let updated = false
      const length = stored.length

      for (let i = 0; i < length; i++) {
        if (stored[i][key] === value[key]) {
          updated = true
          stored[i] = value
        }
      }

      if (!updated) {
        stored.push(value)
      }

      localStorage.setItem(table, JSON.stringify(stored))

      resolve(value)
    })
  }

  /**
   * Set multiple values.
   *
   * @param  {String} table  The table
   * @param  {Array}  values Array of values
   * @return {Promise}
   */
  setAll (table, values) {
    return Promise.all(values.map((value) => this.set(table, value)))
  }

  /**
   * Get table value.
   *
   * @param  {String}        table The table name
   * @param  {String|Number} id    The table id
   * @return {Promise}
   */
  get (table, id) {
    const key = this._key()

    return new Promise((resolve, reject) => {
      const stored = JSON.parse(localStorage.getItem(table))
      const length = stored ? stored.length : 0

      for (let i = 0; i < length; i++) {
        if (stored[i][key] === id) {
          resolve(stored[i])
        }
      }
      resolve(null)
    })
  }

  /**
   * Get all table values.
   *
   * @param  {String} table The table name
   * @return {Promise}
   */
  getAll (table) {
    return new Promise((resolve, reject) => {
      const value = localStorage.getItem(table)
      resolve(value ? JSON.parse(value) : [])
    })
  }

  /**
   * Remove id from the table.
   *
   * @param  {String}        table The table name
   * @param  {String|Number} id    The table id
   * @return {Promise}
   */
  remove (table, id) {
    const key = this._key()

    return new Promise((resolve, reject) => {
      const stored = JSON.parse(localStorage.getItem(table))
      const length = stored.length

      for (let i = 0; i < length; i++) {
        if (stored[i][key] === id) {
          stored.splice(i, 1)
          localStorage.setItem(table, JSON.stringify(stored))
          break
        }
      }

      resolve()
    })
  }

  /**
   * Clear the table.
   *
   * @param  {String} table The table name
   * @return {Promise}
   */
  removeAll (table) {
    return new Promise((resolve, reject) => {
      localStorage.removeItem(table)
      resolve()
    })
  }
}
