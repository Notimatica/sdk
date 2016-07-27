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
   * Set value to the entity.
   *
   * @param  {String} entity The entity name
   * @param  {Object} value  The value
   * @return {Promise}
   */
  set (entity, value) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([entity], 'readwrite')
            .objectStore(entity)
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
   * Get entity value.
   *
   * @param  {String}        entity The entity
   * @param  {String|Number} id     The entity id
   * @return {Promise}
   */
  get (entity, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([entity], 'readwrite')
            .objectStore(entity)
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
   * Get all entity values.
   *
   * @param  {String} entity The entity
   * @return {Promise}
   */
  getAll (entity) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const request = database
            .transaction([entity], 'readwrite')
            .objectStore(entity)
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
   * Remove id from the entity.
   *
   * @param  {String}        entity The entity
   * @param  {String|Number} id     The entity id
   * @return {Promise}
   */
  remove (entity, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        const request = database
          .transaction([entity], 'readwrite')
          .objectStore(entity)
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
   * Clear the entity.
   *
   * @param  {String} entity The entity
   * @return {Promise}
   */
  removeAll (entity) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        const request = database
          .transaction([entity], 'readwrite')
          .objectStore(entity)
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
        return Promise.all(this.options.tables.map((entity) => {
          return this.removeAll(entity)
        }))
      })
    )
  }
}
