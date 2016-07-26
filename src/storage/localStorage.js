export default class LocalStorage {
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
  }

  setAll (entity, values) {
    const all = []
    values.forEach(value => {
      all.push(this.set(entity, value))
    })

    return Promise.all(all)
  }

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
  }

  getAll (entity) {
    return new Promise((resolve, reject) => {
      const value = localStorage.getItem(entity)
      resolve(value ? JSON.parse(value) : [])
    })
  }

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
  }

  removeAll (entity) {
    return new Promise((resolve, reject) => {
      localStorage.removeItem(entity)
      resolve()
    })
  }

  close () {
    // There is nothing to do
  }
}
