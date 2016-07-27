import AbstractDriver from './abstract'
import { POPUP_URL } from '../../defaults'

module.exports = class Popup extends AbstractDriver {
  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
    Notimatica.on('popup:subscribed', (data) => {
      return this._finishSubscription(data.token)
    })

    Notimatica.on('popup:unsubscribed', () => {
      return this._finishUnsubscription()
    })

    return super.ready()
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
      const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
      const eventer = window[eventMethod]
      const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

      eventer(messageEvent, function (event) {
        if (!(/^https:\/\/([a-z0-9\-]+)\.notimatica\.io$/.test(event.origin))) return

        Notimatica.emit(event.data.event, event.data.data)
      }, false)

      const href = `${POPUP_URL}/${project}`
      window.open(href, 'notimatica', `width=${this.options.popup.width},height=${this.options.popup.height}`)
    })
  }
}
