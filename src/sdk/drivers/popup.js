import AbstractDriver from './abstract'
import { POPUP_URL } from '../../defaults'

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

    Notimatica.on('iframe:ready', () => {
      this.iframeLoaded = true
    })

    return new Promise((resolve) => {
      this._preparePostEvents()

      const body = document.body
      const iframe = document.createElement('iframe')

      iframe.src = `https://${this.options.subdomain}.notimatica.io/http-iframe?top=${encodeURIComponent(document.location.href)}`
      iframe.name = 'notimatica-iframe'
      iframe.style = 'width:0; height:0; border:0; border:none'
      body.appendChild(iframe)

      resolve()
    })
  }

  /**
   * Load events.
   */
  _preparePostEvents () {
    const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

    eventer(messageEvent, function (event) {
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

    return this._open(this.options.project)
      .catch((err) => Notimatica.emit('subscribe:fail', err))
  }

  /**
   * Unsubscribe from notifications.
   *
   * @return {Promise}
   */
  unsubscribe () {
    Notimatica.emit('unsubscribe:start')

    return this._open(this.options.project)
      .catch((err) => Notimatica.emit('unsubscribe:fail', err))
  }

  /**
   * Open popup.
   *
   * @param  {String} project The project uuid
   */
  _open (project) {
    return new Promise((resolve) => {
      const href = `${POPUP_URL}/${project}`
      window.open(href, 'notimatica', `width=${this.options.popup.width},height=${this.options.popup.height}`)

      resolve()
    })
  }
}
