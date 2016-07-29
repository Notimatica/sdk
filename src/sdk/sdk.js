import events from 'minivents'
import logs from '../logs'
import Visitor from '../visitor'
import { merge, isHttps } from '../utils'
import { DEBUG, DRIVER_NATIVE, DRIVER_POPUP, POPUP_HEIGHT, POPUP_WIGHT, SDK_PATH } from '../defaults'

const Notimatica = {
  _inited: false,
  _driver: null,
  _debug: DEBUG,
  visitor: null,
  options: {
    debug: DEBUG,
    project: null,
    safariWebId: null,
    subdomain: null,
    tags: [],
    autorun: false,
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
    webhookCors: true
  },
  strings: {
    en: {
      'popup.welcome': 'Subscraibe to {project}',
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
    this._loadPlugins()
    this._inited = true
    this.emit('ready')

    this.autorun()
      .then((autorun) => {
        if (autorun && this.isUnsubscribed() && !this._usePopup()) {
          return this._driver.subscribe()
        }
      })
  },

  /**
   * Load enabled plugins.
   */
  _loadPlugins () {
    for (let name in this.options.plugins) {
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
      { key: 'webhook_cors', value: this.options.webhookCors },
      { key: 'match_exact_url', value: this.options.matchExactUrl },
      { key: 'page_title', value: document.title },
      { key: 'base_url', value: document.location.origin }
    ])
  },

  /**
   * Prepare popup.
   *
   * @param  {Object} visitor The visitor object.
   * @return {Promise}
   */
  _prepareDriver () {
    const driver = this._usePopup() ? DRIVER_POPUP : DRIVER_NATIVE
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
      this._ready()
    })
    this.on('plugin:ready', (plugin) => {
      this.strings = merge(plugin.strings, this.strings)
      plugin.init(this.options.plugins[plugin.name])
    })
    this.on('autorun:disable', (plugin) => {
      this.visitor.storage.set('key_value', { key: 'autorun', value: false })
    })
    this.on('warning', (message) => {
      this.warn('Attantion', message)
    })
    this.on('error', (error) => {
      this.error('Error', error)
    })

    if (this.options.debug) {
      this.on('ready', () => {
        this.debug('SDK inited with:', this.options)
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
    }
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
   * Autorun enabled.
   *
   * @return {Promise}
   */
  autorun () {
    return this.visitor.storage.get('key_value', 'autorun')
      .then((autorun) => (autorun) ? autorun.value : this.options.autorun)
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
    return this.visitor.storage.removeAll('notifications')
  },

  /**
   * Reset notifications history.
   *
   * @return {Promise}
   */
  resetState () {
    return this.visitor.storage.removeAll('key_value')
  },

  /**
   * Reset everything.
   *
   * @return {Promise}
   */
  resetAll () {
    return this.visitor.storage.reset()
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
