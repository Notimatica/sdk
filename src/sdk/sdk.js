import events from 'minivents'
import logs from '../mixins/logs'
import Visitor from '../visitor'
import { merge, isHttps, filterObject } from '../utils'
import { DEBUG, DRIVER_NATIVE, DRIVER_POPUP, POPUP_HEIGHT, POPUP_WIGHT, SDK_PATH } from '../defaults'

const Notimatica = {
  _inited: false,
  _driver: null,
  _debug: DEBUG,
  _enabledPlugins: {},
  _plugins: {},
  visitor: null,
  options: {
    debug: DEBUG,
    project: null,
    safariWebId: null,
    subdomain: null,
    tags: [],
    autoSubscribe: false,
    usePopup: false,
    popup: {
      width: POPUP_WIGHT,
      height: POPUP_HEIGHT
    },
    matchExactUrl: true,
    plugins: {},
    sdkPath: SDK_PATH,
    strings: {},
    defaultLocale: 'en',
    webhooks: {},
    webhooksCors: true
  },
  strings: {
    en: {
      'popup.welcome': 'Subscribe to {project}',
      'popup.subscribe': 'Do you want to receive notifications from {project}?',
      'popup.subscribed': 'You are subscribed to notifications from {project}.',
      'popup.unsupported': 'Your browser don\'t support push notifications.',
      'popup.buttons.subscribe': 'Subscribe',
      'popup.buttons.unsubscribe': 'Unsubscribe',
      'popup.buttons.cancel': 'Cancel'
    }
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init (options) {
    if (this._inited) return this.warn('SDK was already inited.')

    this.options = merge(this.options, options || {})
    this.strings = merge(this.strings, this.options.strings)
    delete this.options.strings

    this._debug = this.options.debug

    if (this.options.project === null) return this.error('Project ID is absent.')

    this._prepareEvents()
    this._prepareVisitor()
      .then(() => this._prepareDriver())
      .catch((err) => {
        err.message === 'unsupported'
          ? this.emit('unsupported')
          : this.emit('error', err)
      })
  },

  /**
   * Driver is ready, SDK is good to go.
   */
  _ready () {
    this._inited = true
    this.emit('ready')

    this.autoSubscribeEnabled()
      .then((autoSubscribeEnabled) => {
        if (autoSubscribeEnabled && this.isUnsubscribed() && !this.usePopup()) {
          this.emit('autoSubscribe:start')
        }
      })
  },

  /**
   * Load enabled plugins.
   */
  _loadPlugins () {
    this._enabledPlugins = filterObject(this.options.plugins, (plugin) => plugin.enable)

    for (let name in Notimatica._enabledPlugins) {
      if (this.options.plugins[name].enable) {
        const head = document.head
        const script = document.createElement('script')

        script.type = 'text/javascript'
        script.src = `${this.options.sdkPath}/notimatica-${name}.js`
        script.async = 'true'
        head.appendChild(script)
      }
    }
  },

  /**
   * Prepare visitor.
   */
  _prepareVisitor () {
    this.visitor = new Visitor()

    return this.visitor.storage.setAll('key_value', [
      { key: 'debug', value: this.options.debug },
      { key: 'project', value: this.options.project },
      { key: 'webhooks', value: this.options.webhooks },
      { key: 'webhooksCors', value: this.options.webhooksCors },
      { key: 'matchExactUrl', value: this.options.matchExactUrl },
      { key: 'pageTitle', value: document.title },
      { key: 'baseUrl', value: document.location.origin }
    ])
  },

  /**
   * Prepare popup.
   *
   * @param  {Object} visitor The visitor object.
   * @return {Promise}
   */
  _prepareDriver () {
    const driver = this.usePopup() ? DRIVER_POPUP : DRIVER_NATIVE
    const Driver = require('./drivers/' + driver)

    this._driver = new Driver(this.options)

    if (!this._driver.pushSupported()) throw new Error('unsupported')

    return this._driver.prepare()
      .then(() => this.visitor.storage.set('key_value', { key: 'provider', value: this._driver.provider.name }))
  },

  /**
   * Prepare SDK events.
   */
  _prepareEvents () {
    this.on('driver:ready', (driver) => {
      this.debug('Driver is ready', driver)

      // When driver is ready, load plugins.
      this._loadPlugins()
    })
    this.on('plugin:ready', (plugin) => {
      this.strings = merge(plugin.strings, this.strings)

      // Init plugin and only after that add it to the _plugins registry
      // If every plugin is inited, run _ready, because we are...ready
      plugin.init(this.options.plugins[plugin.name])
        .then(() => {
          this.debug(`Plugin "${plugin.name}" inited`)

          this._plugins[plugin.name] = plugin
          if (this.allPluginsReady()) {
            this._ready()
          }
        })
    })
    this.on('autoSubscribe:start', () => {
      this.debug('Autosubscribing started')
      this.subscribe()
    })
    this.on('user:message', (title, message) => {
      this.debug([title, message].join(' - '))
    })
    this.on('warning', (message) => {
      this.warn('Attention', message)
    })
    this.on('error', (error) => {
      this.error('Error', error)
    })

    // Debug
    this.on('ready', () => {
      this.debug('SDK is fully ready with:', this.options)
    })
    this.on('iframe:ready', (uuid) => {
      this.debug('Iframe is ready', uuid)
    })
    this.on('unsupported', (message) => {
      this.warn('Push notifications are not yet available for your browser.')
    })
    this.on('subscribe:start', () => {
      this.debug('Start subscribing.')
    })
    this.on('subscribe:success', (token) => {
      this.debug('User subscribed with token', token)
    })
    this.on('subscribe:subscription', (subscription) => {
      this.debug('Subscription recieved', subscription)
    })
    this.on('subscribe:fail', (err) => {
      this.error('Subscription failed', err)
    })
    this.on('register:start', (data) => {
      this.debug('Start registering subscriber', data)
    })
    this.on('register:success', (data) => {
      this.debug('Subscriber registered:', data)
    })
    this.on('register:fail', (err) => {
      this.error('Registration failed', err)
    })
    this.on('unsubscribe:start', () => {
      this.debug('Start unsubscribing.')
    })
    this.on('unsubscribe:success', () => {
      this.debug('User unsubscribed.')
    })
    this.on('unsubscribe:fail', (err) => {
      this.error('Unsubscription failed', err)
    })
    this.on('unregister:start', (data) => {
      this.debug('Start removing registration', data)
    })
    this.on('unregister:success', () => {
      this.debug('Registration removed.')
    })
    this.on('unregister:fail', (err) => {
      this.error('Removing registration failed', err)
    })
  },

  /**
   * Check if push notifications supported.
   *
   * @return {Boolean}
   */
  pushSupported () {
    return this._driver.pushSupported()
  },

  /**
   * If automatic subscribing enabled.
   *
   * @return {Promise}
   */
  autoSubscribeEnabled () {
    return this.visitor.storage.get('key_value', 'autoSubscribe')
      .then((autoSubscribe) => (autoSubscribe) ? autoSubscribe.value : this.options.autoSubscribe)
  },

  /**
   * Distable automatic subscribing.
   *
   * @return {Promise}
   */
  disableAutoSubscribe () {
    this.debug('Automatic subscribing disabled')
    this.visitor.storage.set('key_value', { key: 'autoSubscribe', value: false })
  },

  /**
   * Use popup or native subscription process.
   *
   * @return {Boolean}
   */
  usePopup () {
    return !isHttps() || this.options.usePopup
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
    return this._driver.isSubscribed
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
   * Reset notifications history.
   *
   * @return {Promise}
   */
  resetHistory () {
    this.debug('History cleared')

    return this.visitor.storage.removeAll('notifications')
  },

  /**
   * Reset notifications history.
   *
   * @return {Promise}
   */
  resetState () {
    this.debug('State cleared')

    return this.visitor.storage.removeAll('key_value')
  },

  /**
   * Reset everything.
   *
   * @return {Promise}
   */
  resetAll () {
    this.debug('Full reset')

    return this.visitor.storage.reset()
  },

  /**
   * If all enabled plugins are ready.
   *
   * @return {Boolean}
   */
  allPluginsReady () {
    return Object.keys(this._plugins).length === Object.keys(this._enabledPlugins).length
  },

  /**
   * Implement array's push method to handle push calls.
   *
   * @param {Array|Function} item Method call. [method_name, args...]
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
   * @param {Array} array History of calls
   */
  _processRegisteredActions (array) {
    for (let i = 0; i < array.length; i++) {
      this.push(array[i])
    }
  }
}

events(Notimatica)
logs(Notimatica, 'Notimatica SDK: ')

module.exports = Notimatica
