import AbstractDriver from './abstract'
import { toQueryString } from '../../utils'

module.exports = class Popup extends AbstractDriver {
  /**
   * Constructor.
   * @param  {Object} options Options
   */
  constructor (options) {
    super(options)
    this.iframeLoaded = false
  }

  /**
   * Driver name.
   *
   * @return {String}
   */
  get name () {
    return 'popup'
  }

  /**
   * Prepare driver.
   */
  prepare () {
    if (!this.options.subdomain) throw new Error('You have to fill "subdomain" option to use popup fallback for HTTP site.')

    Notimatica.on('popup:subscribed', (data) => {
      return this._finishSubscription(data.token)
    })

    Notimatica.on('popup:unsubscribed', () => {
      return this._finishUnsubscription()
    })

    Notimatica.on('iframe:ready', (iframeUuid) => {
      this.iframeLoaded = true

      if (iframeUuid) {
        Notimatica.visitor.uuid()
          .then((uuid) => {
            if (iframeUuid !== uuid) {
              this.silent = true
              return this._finishSubscription(uuid)
            }
          })
          .then(() => Notimatica.emit('driver:ready', this))
      } else {
        Notimatica.emit('driver:ready', this)
      }
    })

    this._preparePostEvents()

    return this._prepareIframe()
      .then(() => Notimatica.visitor.isSubscribed())
      .then((isSubscribed) => {
        this.isSubscribed = isSubscribed
      })
  }

  /**
   * Insert iframe to the page to track active clients.
   *
   * @return {Promise}
   */
  _prepareIframe () {
    return new Promise((resolve) => {
      const body = document.body
      const iframe = document.createElement('iframe')
      const query = {
        tags: this.options.tags,
        parent: document.location.href
      }

      iframe.src = `https://${this.options.subdomain}.notimatica.io/http-iframe?${toQueryString(query)}`
      iframe.name = 'notimatica-iframe'
      iframe.style = 'width:0; height:0; border:0; border:none'
      body.appendChild(iframe)
    })
  }

  /**
   * Load events.
   */
  _preparePostEvents () {
    const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

    eventer(messageEvent, (event) => {
      if (event.origin.indexOf(`https://${this.options.subdomain}.notimatica.io`) === -1) return

      Notimatica.emit(event.data.event, event.data.data)
    }, false)
  }

  /**
   * Subscribe to notifications.
   *
   * @return {Promise}
   */
  subscribe () {
    Notimatica.emit('subscribe:start')

    return this._openPopup(this.options.project)
      .catch((err) => Notimatica.emit('subscribe:fail', err))
  }

  /**
   * Unsubscribe from notifications.
   *
   * @return {Promise}
   */
  unsubscribe () {
    Notimatica.emit('unsubscribe:start')

    return this._openPopup(this.options.project)
      .catch((err) => Notimatica.emit('unsubscribe:fail', err))
  }

  /**
   * Open popup.
   *
   * @param  {String} project The project uuid
   * @return {Promise}
   */
  _openPopup (project) {
    return new Promise((resolve) => {
      const query = {
        tags: this.options.tags
      }

      const href = `https://${this.options.subdomain}.notimatica.io/?${toQueryString(query)}`

      window.open(href, 'notimatica', `width=${this.options.popup.width},height=${this.options.popup.height}`)

      resolve()
    })
  }
}
