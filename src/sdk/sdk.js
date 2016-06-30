import events from 'minivents'
import { merge, isHttps } from '../utils'
import { DEBUG, DRIVER_NATIVE, DRIVER_POPUP, POPUP_HEIGHT, POPUP_WIGHT } from '../defaults'

const Notimatica = {
  _inited: false,
  _driver: null,
  _subscribed: false,
  options: {
    debug: DEBUG,
    project: null,
    tags: [],
    autoSubscribe: true,
    usePopup: false,
    popup: {
      width: POPUP_WIGHT,
      height: POPUP_HEIGHT
    }
  },

  /**
   * Init SDK.
   *
   * @param {Object} options
   */
  init (options) {
    if (Notimatica._inited) return console.warn('Notimatica SDK was already inited.')

    merge(Notimatica.options, options || {})

    if (Notimatica.options.project === null) return Notimatica.emit('error', 'Project ID is absent.')

    Notimatica._prepareEvents()
    Notimatica._prepareDriver()

    if (Notimatica.pushSupported()) {
      Notimatica._driver.ready()
        .then(({isSubscribed, wasUnsubscribed}) => {
          Notimatica._ready()

          if (Notimatica.options.autoSubscribe && !Notimatica._usePopup() && !wasUnsubscribed && !isSubscribed) {
            Notimatica._driver.subscribe()
          }
        })
    }
  },

  /**
   * SDK is ready.
   */
  _ready () {
    Notimatica._inited = true
    Notimatica.emit('ready')
  },

  /**
   * Prepare popup.
   *
   * @param  {Object} visitor The visitor object.
   */
  _prepareDriver () {
    const driver = Notimatica._usePopup() ? DRIVER_POPUP : DRIVER_NATIVE
    const Driver = require('./drivers/' + driver)

    Notimatica._driver = new Driver(Notimatica.options)
  },

  _prepareEvents () {
    Notimatica.on('ready', function () {
      console.info('Notimatica SDK inited with:', Notimatica.options)
    })
    Notimatica.on('error', function (error) {
      console.error(error)
    })

    if (Notimatica.options.debug) {
      Notimatica.on('api:call', function (method, url, data) {
        console.log('API call:', method, url, data)
      })
      Notimatica.on('api:fail', function (status, data) {
        console.error('API call failed:', status, data)
      })
      Notimatica.on('driver:create', function (driver) {
        console.log('Driver created:', driver)
      })
      Notimatica.on('subscribe:start', function () {
        console.log('Start subscribing.')
      })
      Notimatica.on('subscribe:success', function (token) {
        console.log('User subscribed with token:', token)
      })
      Notimatica.on('subscribe:subscription', function (subscription) {
        console.log('Subscription recieved:', subscription)
      })
      Notimatica.on('subscribe:fail', function (err) {
        console.error('Subscription failed:', err)
      })
      Notimatica.on('register:start', function (data) {
        console.log('Start registering subscriber:', data)
      })
      Notimatica.on('register:success', function (data) {
        console.log('Subscriber registered:', data)
      })
      Notimatica.on('register:fail', function (err) {
        console.error('Registration failed:', err)
      })
      Notimatica.on('unsubscribe:start', function () {
        console.log('Start unsubscribing.')
      })
      Notimatica.on('unsubscribe:success', function () {
        console.log('User unsubscribed.')
      })
      Notimatica.on('unsubscribe:fail', function (err) {
        console.error('Unsubscription failed:', err)
      })
      Notimatica.on('unregister:start', function (data) {
        console.log('Start removing registration:', data)
      })
      Notimatica.on('unregister:success', function () {
        console.log('Registration removed.')
      })
      Notimatica.on('unregister:fail', function (err) {
        console.error('Removing registration failed:', err)
      })
    }
  },

  /**
   * Check if push notifications supported.
   *
   * @returns {Boolean}
   */
  pushSupported () {
    return Notimatica._driver.pushSupported()
  },

  /**
   * Register service worker.
   */
  subscribe () {
    if (!Notimatica.pushSupported()) {
      Notimatica.emit('subscribe:fail', 'Web push unsupported by browser.')
      return
    }

    Notimatica._driver.subscribe()
  },

  /**
   * Use popup or native subscription process.
   *
   * @return {Boolean}
   */
  _usePopup () {
    return !isHttps() || Notimatica.options.usePopup
  },

  /**
   * Unsubscribe to notifications.
   *
   * @returns {Promise}
   */
  unsubscribe () {
    if (Notimatica.isUnsubscribed()) {
      Notimatica.emit('unsubscribe:success')
      return
    }

    Notimatica._driver.unsubscribe()
  },

  /**
   * If user is subscribed.
   *
   * @return {Boolean}
   */
  isSubscribed () {
    return Notimatica._driver.isSubscribed
  },

  /**
   * If user is unsubscribed.
   *
   * @return {Boolean}
   */
  isUnsubscribed () {
    return !Notimatica._driver.isSubscribed
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
      Notimatica[functionName].apply(null, item)
    }
  },

  /**
   * Handle already registered actions.
   *
   * @param  {Array} array History of calls
   */
  _processRegisteredActions (array) {
    for (let i = 0; i < array.length; i++) {
      Notimatica.push(array[i])
    }
  }
}

events(Notimatica)

module.exports = Notimatica
