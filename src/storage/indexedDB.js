export default class IndexedDBStorage {
  constructor (options) {
    this.options = options
    this.indexedDB = indexedDB || mozIndexedDB || webkitIndexedDB || msIndexedDB
    this.db = null
  }

  connect () {
    return new Promise((resolve, reject) => {
      if (this.db) resolve(this.db)

      const request = this.indexedDB.open(this.options.name)
      request.onupgradeneeded = (event) => {
        this.db = event.target.result
        this.options.tables.forEach((table) => {
          this.db.createObjectStore(table.name, { keyPath: table.key })
          resolve(this.db)
        })
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

  get (entity, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const transaction = database.transaction([entity], 'readwrite')
          transaction.onerror = (error) => {
            reject(error)
          }

          const objectStore = transaction.objectStore(entity)
          objectStore.get(id).onsuccess = (event) => {
            resolve(event.target.result)
          }
        } catch (error) {
          resolve(null)
        }
      })
    )
  }

  getAll (entity) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        try {
          const objectArray = []
          const transaction = this.db.transaction([entity], 'readwrite')
          transaction.onerror = (error) => {
            resolve(error)
          }

          const objectStore = transaction.objectStore(entity)
          objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result
            if (cursor) {
              objectArray.push(cursor.value)
              cursor.continue()
            } else {
              resolve(objectArray)
            }
          }
        } catch (error) {
          resolve([])
        }
      })
    )
  }

  remove (entity, id) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        const transaction = this.db.transaction([entity], 'readwrite')
        const objectStore = transaction.objectStore(entity)
        objectStore.delete(id).onsuccess = () => {
          resolve()
        }
      })
    )
  }

  removeAll (entity) {
    return this.connect()
      .then((database) => new Promise((resolve, reject) => {
        database.close()
        const version = this.options.version || parseInt(Math.round(new Date().getTime() / 1000) % 1000000000, 10)
        const request = this.indexedDB.open(this.options.name, version)
        request.onupgradeneeded = () => {
          try {
            this.db = request.result
            if (this.db.objectStoreNames.contains(entity)) {
              this.db.deleteObjectStore(entity)
            }
            resolve()
          } catch (error) {
            // error code 3 and 8 are not found on chrome and canary respectively
            if (error.code !== 3 && error.code !== 8) {
              reject(error)
            } else {
              resolve()
            }
          }
        }
      })
    )
  }
}
