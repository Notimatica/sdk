import $ from 'jbone'

export default class Popover {
  /**
   * Contructor
   * @param  {Object} target
   */
  constructor (target) {
    this.target = target

    this.$popover = this.build()

    Notimatica.on('popover:show', (title, body, options) => {
      this.show(title, body, options)
    })
    Notimatica.on('popover:hide', () => {
      this.hide()
    })
    Notimatica.emit('popover:ready', this)
  }

  /**
   * Widget template.
   *
   * @return {String}
   */
  get template () {
    /*eslint quotes: 0*/
    return `<div class="notimatica-popover">
      <div class="notimatica-popover-title" style="display:none;"></div>
      <div class="notimatica-popover-content" style="display:none;"></div>
      <div class="notimatica-popover-close">x</div>
    </div>`
  }

  /**
   * Build element.
   *
   * @return {Object}
   */
  build () {
    const $popover = $(this.template)
      .addClass('fade')

    $popover.find('.notimatica-popover-close').on('click', () => {
      this.hide()
    })

    return $popover.appendTo(this.target)
  }

  /**
   * Show popover.
   *
   * @param  {String} title The title
   * @param  {String} body  The body
   */
  show (title, body) {
    if (title) {
      this.$popover.find('.notimatica-popover-title')
        .html(title).css({display: 'block'})
    }
    if (body) {
      this.$popover.find('.notimatica-popover-content')
        .html(body).css({display: 'block'})
    }
    this.$popover.addClass('in')
  }

  /**
   * Hide popover.
   */
  hide () {
    this.$popover.removeClass('in')
  }
}
