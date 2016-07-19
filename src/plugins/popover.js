import $ from 'jbone'

export default class Popover {
  /**
   * Contructor
   * @param  {Object} target
   */
  constructor (target) {
    this.target = target

    this.$popover = this.build()
  }

  /**
   * Widget template.
   *
   * @return {String}
   */
  get template () {
    /*eslint quotes: 0*/
    return `<div class="notimatica-popover">
      <div class="notimatica-popover-title"></div>
      <div class="notimatica-popover-content"></div>
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
      .on('blur', () => this.hide())

    return this.target.parent().append($popover)
  }

  /**
   * Show popover.
   *
   * @param  {String} title [description]
   * @param  {[String]} body  [description]
   */
  show (title, body) {
    this.$popover.find('.notimatica-popover-title').html(title)
    this.$popover.find('.notimatica-popover-content').html(body)
    this.$popover.addClass('in')
    console.log('Show popover')
  }

  hide () {
    this.$popover.removeClass('in')
  }
}
