import events from 'minivents'
import Visitor from '../visitor'
import { merge, isHttps } from '../utils'
import { DEBUG, DRIVER_NATIVE, DRIVER_POPUP, POPUP_HEIGHT, POPUP_WIGHT, SDK_PATH } from '../defaults'

const Notimatica = {
  _inited: false,
  _driver: null,
  _subscribed: false,
  visitor: null,
  strings: {},
  options: {
    debug: DEBUG,
    project: null,
    tags: [],
    autoSubscribe: true,
    usePopup: false,
    popup: {
      width: POPUP_WIGHT,
      height: POPUP_HEIGHT
    },
    plugins: {},
    sdkPath: SDK_PATH,
    strings: {},
    defaultLocale: 'en'
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init (options) {
    if (this._inited) return console.warn('Notimatica: SDK was already inited.')

    this.options = merge(this.options, options || {})
    this.strings = merge(this.strings, this.options.strings)
    delete this.options.strings

    if (this.options.project === null) return this.emit('error', 'Notimatica: Project ID is absent.')

    this._prepareVisitor()
    this._prepareEvents()
    this._prepareDriver()

    if (this.pushSupported()) {
      this._driver.ready()
        .then(({isSubscribed, wasUnsubscribed}) => {
          this._ready()

          if (this.options.autoSubscribe && !this._usePopup() && !wasUnsubscribed && !isSubscribed) {
            this._driver.subscribe()
          }
        })
    } else {
      this.emit('unsupported', 'Notimatica: Push notifications are not yet available for your browser.')
    }
  },

  /**
   * SDK is ready.
   */
  _ready () {
    this._loadPlugins()
    this._inited = true
    this.emit('ready')
  },

  /**
   * Load enabled plugins.
   */
  _loadPlugins () {
    for (let name in this.options.plugins) {
      const head = document.head
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = this.options.sdkPath + '/notimatica-' + name + '.js'
      script.async = 'true'
      head.appendChild(script)
    }
  },

  /**
   * Prepare visitor.
   */
  _prepareVisitor () {
    this.visitor = new Visitor()
  },

  /**
   * Prepare popup.
   *
   * @param  {Object} visitor The visitor object.
   */
  _prepareDriver () {
    const driver = this._usePopup() ? DRIVER_POPUP : DRIVER_NATIVE
    const Driver = require('./drivers/' + driver)

    this._driver = new Driver(this.options)
  },

  _prepareEvents () {
    this.on('ready', () => {
      console.info('Notimatica: SDK inited with:', this.options)
    })
    this.on('plugin:ready', (plugin) => {
      this.strings = merge(plugin.strings, this.strings)
      plugin.init(this.options.plugins[plugin.name])
    })
    this.on('unsupported', (message) => {
      console.warn('Notimatica: ' + message)
    })
    this.on('warning', (message) => {
      console.warn('Notimatica: ' + message)
    })
    this.on('error', (error) => {
      console.error('Notimatica: ', error)
    })

    if (this.options.debug) {
      this.on('api:call', (method, url, data) => {
        console.log('Notimatica: API call', method, url, data)
      })
      this.on('api:fail', (status, data) => {
        console.error('Notimatica: API call failed', status, data)
      })
      this.on('driver:create', (driver) => {
        console.log('Notimatica: Driver created', driver)
      })
      this.on('subscribe:start', () => {
        console.log('Notimatica: Start subscribing.')
      })
      this.on('subscribe:success', (token) => {
        console.log('Notimatica: User subscribed with token', token)
      })
      this.on('subscribe:subscription', (subscription) => {
        console.log('Notimatica: Subscription recieved', subscription)
      })
      this.on('subscribe:fail', (err) => {
        console.error('Notimatica: Subscription failed', err)
      })
      this.on('register:start', (data) => {
        console.log('Notimatica: Start registering subscriber', data)
      })
      this.on('register:success', (data) => {
        console.log('Notimatica: Subscriber registered:', data)
      })
      this.on('register:fail', (err) => {
        console.error('Notimatica: Registration failed', err)
      })
      this.on('unsubscribe:start', () => {
        console.log('Notimatica: Start unsubscribing.')
      })
      this.on('unsubscribe:success', () => {
        console.log('Notimatica: User unsubscribed.')
      })
      this.on('unsubscribe:fail', (err) => {
        console.error('Notimatica: Unsubscription failed', err)
      })
      this.on('unregister:start', (data) => {
        console.log('Notimatica: Start removing registration', data)
      })
      this.on('unregister:success', () => {
        console.log('Notimatica: Registration removed.')
      })
      this.on('unregister:fail', (err) => {
        console.error('Notimatica: Removing registration failed', err)
      })
    }
  },

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported () {
    return this._driver.pushSupported()
  },

  /**
   * Register service worker.
   */
  subscribe () {
    if (!this.pushSupported()) {
      return this.emit('subscribe:fail', 'Web push unsupported by browser.')
    }

    this._driver.subscribe()
  },

  /**
   * Use popup or native subscription process.
   *
   * @return {Boolean}
   */
  _usePopup () {
    return !isHttps() || this.options.usePopup
  },

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    if (this.isUnsubscribed()) {
      return this.emit('unsubscribe:success')
    }

    this._driver.unsubscribe()
  },

  /**
   * If user is subscribed.
   *
   * @return {Boolean}
   */
  isSubscribed () {
    return this._driver.isSubscribed && !this._driver.wasUnsubscribed
  },

  /**
   * If user is unsubscribed.
   *
   * @return {Boolean}
   */
  isUnsubscribed () {
    return !this.isSubscribed()
  },

  /**
   * Implement array's push method to handle push calls.
   *
   * @param  {Array|Function} item Method call. [method_name, args...]
   */
  push (item) {
    if (typeof item === 'function') {
      item()
    } else {
      const functionName = item.shift()
      this[functionName].apply(this, item)
    }
  },

  /**
   * Handle already registered actions.
   *
   * @param  {Array} array History of calls
   */
  _processRegisteredActions (array) {
    for (let i = 0; i < array.length; i++) {
      this.push(array[i])
    }
  }
}

events(Notimatica)

module.exports = Notimatica
