import IndexedDBStorage from './indexedDB'
import LocalStorage from './localStorage'
import { DB_VERSION, DB_NAME } from '../defaults'

const options = {
  version: DB_VERSION,
  name: DB_NAME,
  tables: [
    { name: 'key_value', key: 'key' },
    { name: 'notifications', key: 'id' }
  ]
}

// Don't use window due to it's absence in SW scope
export default (indexedDB || webkitIndexedDB || mozIndexedDB || msIndexedDB)
  ? new IndexedDBStorage(options)
  : new LocalStorage(options)
