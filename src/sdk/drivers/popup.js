import Driver from './driver'
import { POPUP_URL } from '../../defaults'

module.exports = class Popup extends Driver {
  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
    Notimatica.on('popup:subscribed', (data) => {
      this.visitor.token(data.token)
        .then(() => {
          Notimatica._subscribed = true
          Notimatica.emit('subscribe:success', data.token)
        })
    })

    Notimatica.on('popup:unsubscribed', () => {
      this.visitor.token(null)
        .then(() => {
          Notimatica._subscribed = false
          Notimatica.emit('unsubscribe:success')
        })
    })

    return super.ready()
  }

  /**
   * If user is subscribed.
   *
   * @return {Boolean}
   */
  isSubscribed () {
    return !!this.token
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
