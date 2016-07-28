export default class IndexedDBStorage {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor (options) {
    this.options = options
    this.indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB
    this.db = null
  }

  /**
   * Connect to database.
   *
   * @return {Promise}
   */
  connect () {
    return new Promise((resolve, reject) => {
      if (this.db) resolve(this.db)

      const request = this.indexedDB.open(this.options.name)
      request.onupgradeneeded = (event) => {
        this.db = event.target.result
        this.options.tables.map((table) => {
          this.db.createObjectStore(table.name, { keyPath: table.key })
        })
        resolve(this.db)
      }
      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }
      request.onerror = (event) => {
        reject(event.target.error)
      }
    })
  }

  /**
   * Set value to the table.
   *
   * @param  {String} table The table name
   * @param  {Object} value The value
   * @return {Promise}
   */
  set (table, value) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([table], 'readwrite')
            .objectStore(table)
            .put(value)

          request.onsuccess = () => {
            resolve(value)
          }
          request.onerror = (error) => {
            reject(error)
          }
        } catch (error) {
          reject(error)
        }
      })
    )
  }

  /**
   * Set multiple values.
   *
   * @param  {String} table  The table
   * @param  {Array}  values Array of values
   * @return {Promise}
   */
  setAll (table, values) {
    return Promise.all(values.map((value) => {
      return this.set(table, value)
    }))
  }

  /**
   * Get table value.
   *
   * @param  {String}        table The table
   * @param  {String|Number} id    The table id
   * @return {Promise}
   */
  get (table, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([table], 'readwrite')
            .objectStore(table)
            .get(id)

          request.onsuccess = (event) => {
            resolve(event.target.result)
          }
          request.onerror = (err) => {
            reject(err)
          }
        } catch (error) {
          resolve(null)
        }
      })
    )
  }

  /**
   * Get all table values.
   *
   * @param  {String} table The table
   * @return {Promise}
   */
  getAll (table) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([table], 'readwrite')
            .objectStore(table)
            .getAll()

          request.onsuccess = (event) => {
            resolve(event.target.result)
          }
          request.onerror = (err) => {
            reject(err)
          }
        } catch (error) {
          resolve([])
        }
      })
    )
  }

  /**
   * Remove id from the table.
   *
   * @param  {String}        table The table
   * @param  {String|Number} id    The table id
   * @return {Promise}
   */
  remove (table, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        const request = database
          .transaction([table], 'readwrite')
          .objectStore(table)
          .delete(id)

        request.onsuccess = () => {
          resolve()
        }
        request.onerror = (err) => {
          reject(err)
        }
      })
    )
  }

  /**
   * Clear the table.
   *
   * @param  {String} table The table
   * @return {Promise}
   */
  removeAll (table) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        const request = database
          .transaction([table], 'readwrite')
          .objectStore(table)
          .clear()

        request.onsuccess = () => {
          resolve()
        }
        request.onerror = (err) => {
          reject(err)
        }
      })
    )
  }

  /**
   * Reset database.
   *
   * @return {Promise}
   */
  reset () {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        return Promise.all(this.options.tables.map((table) => {
          return this.removeAll(table)
        }))
      })
    )
  }
}
