import base64 from 'base64-js'
import { TextEncoderLite } from 'text-encoder-lite-module'
import AbstractDriver from './abstract'
import { toQueryString, t } from '../../utils'

module.exports = class Popup extends AbstractDriver {

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
   *
   * @return {Promise}
   */
  prepare () {
    if (!this.options.subdomain) throw new Error('You have to fill "subdomain" option to use popup fallback for HTTP-site.')

    Notimatica.on('visitor:set-extra', () => {
      this._prepareIframe()
    })

    this._preparePostEvents()

    return this._prepareIframe()
      .then((iframeUuid) => {
        return iframeUuid
          ? this._finishRegistration(iframeUuid)
          : this._finishUnregistration()
      })
      .then(() => Notimatica.emit('driver:ready', this))
  }

  /**
   * Subscribe to post events from popup and iframe.
   */
  _preparePostEvents () {
    const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

    eventer(messageEvent, (event) => {
      Notimatica.debug(`Received "${event.data.event}" iframe event from the ${event.origin}.`)
      if (event.origin.indexOf(this._fallbackAddress()) !== -1) {
        Notimatica.emit(event.data.event, event.data.data)
      }
    }, false)
  }

  /**
   * Insert iframe to the page to track active clients.
   *
   * @return {Promise}
   */
  _prepareIframe () {
    return new Promise((resolve) => {
      Notimatica.on('iframe:ready', (iframeUuid) => {
        resolve(iframeUuid)
      })

      if (this.iframe) this.iframe.remove()

      this.iframe = document.createElement('iframe')
      const options = {
        extra: base64.fromByteArray(
            new TextEncoderLite('utf-8').encode(
              JSON.stringify(this.options.extra)
            )
          ),
        parent: document.location.href
      }

      this.iframe.src = `${this._fallbackAddress()}/http-iframe?${toQueryString(options)}`
      this.iframe.name = 'notimatica-iframe'
      this.iframe.style = 'width:0; height:0; border:0; border:none'
      document.body.appendChild(this.iframe)
    })
  }

  /**
   * Subscribe to notifications.
   *
   * @return {Promise}
   */
  subscribe () {
    return new Promise((resolve) => {
      Notimatica.on('popup:subscribed', (data) => {
        resolve(data.token)
      })

      this._openPopup(this.options.project)
    })
      .then((uuid) => this._finishRegistration(uuid))
  }

  /**
   * Unsubscribe from notifications.
   *
   * @return {Promise}
   */
  unsubscribe () {
    return new Promise((resolve) => {
      Notimatica.on('popup:unsubscribed', () => {
        resolve()
      })

      this._openPopup(this.options.project)
    })
      .then(() => this._finishUnregistration())
  }

  /**
   * Open popup.
   *
   * @param  {String} project The project uuid
   * @return {Promise}
   */
  _openPopup (project) {
    return new Promise((resolve) => {
      if (this._popup == null || this._popup.closed) {
        const options = {
          extra: this.options.extra,
          strings: {
            [Notimatica.visitor.env.language]: {
              'welcome': t('popup.welcome'),
              'subscribe': t('popup.subscribe'),
              'subscribed': t('popup.subscribed'),
              'unsupported': t('popup.unsupported'),
              'buttons.subscribe': t('popup.buttons.subscribe'),
              'buttons.unsubscribe': t('popup.buttons.unsubscribe'),
              'buttons.cancel': t('popup.buttons.cancel')
            }
          }
        }

        const query = {
          options: base64.fromByteArray(
              new TextEncoderLite('utf-8').encode(
                JSON.stringify(options)
              )
            )
        }

        this._popup = window.open(
          `${this._fallbackAddress()}/?${toQueryString(query)}`,
          'notimatica_popup',
          `width=${this.options.popup.width},height=${this.options.popup.height},toolbar=0,resizable=0,scrollbars=0,location=0,menubar=0,status=0`)
      } else {
        this._popup.focus()
      }

      resolve(this._popup)
    })
  }

  /**
   * Generate fallback address.
   *
   * @return {String}
   */
  _fallbackAddress () {
    return `https://${this.options.subdomain}.notimatica.io`
  }
}
