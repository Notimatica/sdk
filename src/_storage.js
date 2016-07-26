/*!
 * Storage.js JavaScript Library v0.1.0
 * https:// github.com/lcavadas/Storage.js
 *
 * Copyright 2012, Luís Serralheiro
 */

const storage = (readyCallback, type) => {
  const invokeReadyCallBack = database => {
    if (!database) {
      readyCallback()
    } else {
      readyCallback({
        set (entity, value) {
          database.set(entity, value)
        },
        setAll (entity, values) {
          database.setAll(entity, values)
        },
        get (entity, id) {
          database.get(entity, id)
        },
        getAll (entity) {
          database.getAll(entity)
        },
        remove (entity, id) {
          database.remove(entity, id)
        },
        removeAll (entity) {
          database.removeAll(entity)
        },
        ready (callback) {
          database.ready(callback)
        },
        close: database.close
      })
    }
  }

  switch (type) {
    case 'LocalStorage':
      storage.KeyValue(invokeReadyCallBack)
      break
    case 'IndexedDB':
      storage.IndexedDB(invokeReadyCallBack)
      break
    default :
      // IndexedDB
      if (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB) {
        window.console.log('Using IndexedDB')
        storage.IndexedDB(invokeReadyCallBack)
      } else {
        window.console.log('Using LocalStorage')
        // Fallback to localStorage
        storage.KeyValue(invokeReadyCallBack)
      }
      break
  }
}

// localStorage wrapper
storage.KeyValue = (ready) => {
  ready({
    set (entity, value) {
      return new Promise((resolve, reject) => {
        const stored = JSON.parse(localStorage.getItem(entity)) || []
        let updated = false
        const length = stored.length

        for (let i = 0; i < length; i++) {
          if (stored[i].id === value.id) {
            updated = true
            stored[i] = value
          }
        }
        if (!updated) {
          stored.push(value)
        }

        localStorage.setItem(entity, JSON.stringify(stored))

        resolve(value)
      })
    },
    setAll (entity, values) {
      const all = []
      values.forEach(value => {
        all.push(this.set(entity, value))
      })

      return Promise.all(all)
    },
    get (entity, id) {
      return new Promise((resolve, reject) => {
        const stored = JSON.parse(localStorage.getItem(entity))
        const length = stored ? stored.length : 0

        for (let i = 0; i < length; i++) {
          if (stored[i].id === id) {
            resolve(stored[i])
            return
          }
        }
        resolve(null)
      })
    },
    getAll (entity) {
      return new Promise((resolve, reject) => {
        const value = localStorage.getItem(entity)
        resolve(value ? JSON.parse(value) : [])
      })
    },
    remove (entity, id) {
      return new Promise((resolve, reject) => {
        const stored = JSON.parse(localStorage.getItem(entity))
        const length = stored.length

        for (let i = 0; i < length; i++) {
          if (stored[i].id === id) {
            stored.splice(i, 1)
            localStorage.setItem(entity, JSON.stringify(stored))
            break
          }
        }

        resolve()
      })
    },
    removeAll (entity) {
      return new Promise((resolve, reject) => {
        localStorage.removeItem(entity)
        resolve()
      })
    },
    close () {
      // There is nothing to do
    }
  })
}

storage.IndexedDB = (ready) => {
  const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
  // var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction
  let db

  const _createObjectStore = entity => new Promise((resolve, reject) => {
    db.close()
    // IE fails with versions bigger that 9 digits and requires the type to be int (number fails with InvalidAccessError)
    const version = parseInt(Math.round(new Date().getTime() / 1000) % 1000000000, 10)
    const versionRequest = indexedDB.open('storage_js', version)
    versionRequest.onupgradeneeded = () => {
      db = versionRequest.result
      db.createObjectStore(entity, {keyPath: 'id'})
    }
    versionRequest.onsuccess = () => {
      resolve()
    }
  })

  const _set = (entity, value) => new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(entity)) {
        window.console.log(`IndexedDB: going to create objectStore ${entity}`)
        _createObjectStore(entity).then(() => _set(entity, value))
        reject()
      }

      const transaction = db.transaction([entity], 'readwrite')
      const objectStore = transaction.objectStore(entity)
      const request = objectStore.put(value)
      transaction.onerror = error => {
        reject(`IndexedDB Error: ${error.message} (Code ${error.code})`, error)
      }
      request.onsuccess = () => {
        resolve(value)
      }
      request.onerror = error => {
        reject(`IndexedDB Error: ${error.message} (Code ${error.code})`, error)
      }
    } catch (error) {
      // error code 3 and 8 are not found on chrome and canary respectively
      if (error.code !== 3 && error.code !== 8) {
        resolve(null)
      } else {
        window.console.log(`IndexedDB: going to create objectStore ${entity}`)
        return _createObjectStore(entity).then(() => _set(entity, value))
      }
    }
  })

  const _get = (entity, id) => new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([entity], 'readwrite')
      transaction.onerror = error => {
        reject(`IndexedDB Error: ${error.message} (Code ${error.code})`, error)
      }

      const objectStore = transaction.objectStore(entity)
      objectStore.get(id).onsuccess = event => {
        resolve(event.target.result)
      }
    } catch (error) {
      resolve(null)
    }
  })

  const _getAll = entity => new Promise((resolve, reject) => {
    try {
      const objectArray = []
      const transaction = db.transaction([entity], 'readwrite')
      transaction.onerror = error => {
        resolve(`IndexedDB Error: ${error.message} (Code ${error.code})`, error)
      }

      const objectStore = transaction.objectStore(entity)
      objectStore.openCursor().onsuccess = event => {
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

  const _remove = (entity, id) => new Promise((resolve, reject) => {
    const transaction = db.transaction([entity], 'readwrite')
    const objectStore = transaction.objectStore(entity)
    objectStore.delete(id).onsuccess = () => {
      resolve()
    }
  })

  const _removeAll = entity => new Promise((resolve, reject) => {
    db.close()
    const version = parseInt(Math.round(new Date().getTime() / 1000) % 1000000000, 10)
    const request = indexedDB.open('storage_js', version)
    request.onupgradeneeded = () => {
      try {
        db = request.result
        if (db.objectStoreNames.contains(entity)) {
          db.deleteObjectStore(entity)
        }
        resolve()
      } catch (error) {
        // error code 3 and 8 are not found on chrome and canary respectively
        if (error.code !== 3 && error.code !== 8) {
          reject(`IndexedDB Error: ${error.message} (Code ${error.code})`, error)
        } else {
          resolve()
        }
      }
    }
  })

  const _close = () => {
    db.close()
  }

  if (indexedDB) {
    // Now we can open our database
    const request = indexedDB.open('storage_js')
    request.onupgradeneeded = () => {
      window.console.log('UPGRADE NEEDED')
    }
    request.onsuccess = () => {
      db = request.result
      ready({
        set: _set,
        setAll (entity, values, callback) {
          const all = []
          values.forEach(value => {
            all.push(_set(entity, value))
          })

          return Promise.all(all)
        },
        get: _get,
        getAll: _getAll,
        remove: _remove,
        removeAll: _removeAll,
        close: _close
      })
    }
    request.onerror = event => {
      window.console.log('An error ocurred', event)
      ready()
    }
  } else {
    ready()
  }
}

window.storage = storage
