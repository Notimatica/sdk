import { POPUP_URL, POPUP_HEIGHT, POPUP_WIGHT } from './defaults'

module.exports = class Popup {
  /**
   * Constructor.
   *
   * @param  {Object} visitor The visitor.
   */
  constructor (visitor) {
    this.visitor = visitor
  }

  /**
   * Ready.
   *
   * @return {Promise}
   */
  ready () {
    return this.visitor.token()
  }

  /**
   * Open popup.
   *
   * @param  {String} project The project uuid
   */
  open (project) {
    const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'

    eventer(messageEvent, function (event) {
      if (!(/^https:\/\/([a-z0-9\-]+)\.notimatica\.io$/.test(event.origin))) return

      Notimatica.emit(event.data.event, event.data.data)
    }, false)

    const href = `${POPUP_URL}/${project}`
    window.open(href, 'notimatica', `width=${POPUP_WIGHT},height=${POPUP_HEIGHT}`)
  }
}
