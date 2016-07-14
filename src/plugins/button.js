require('./button.scss')

import $ from 'jbone'
import AbstractPlugin from './abstract'
import { SDK_PATH } from '../defaults'

const Button = class Button extends AbstractPlugin {
  /**
   * Plugin name.
   *
   * @return {String}
   */
  get name () {
    return 'button'
  }

  /**
   * Default options.
   *
   * @return {Object}
   */
  get defaults () {
    return {
      autoplay: true,
      target: null,
      position: 'bottom-right',
      tooltip: {
        subscribe: 'Subscribe to notifications?',
        unsubscribe: 'Unsubscribe from notifications?'
      },
      click: function () {
        Notimatica.isSubscribed()
          ? Notimatica.unsubscribe()
          : Notimatica.subscribe()
      },
      css: SDK_PATH + '/notimatica-button.css',
      cssTarget: null
    }
  }

  /**
   * Widget template.
   *
   * @return {String}
   */
  get template () {
    /*eslint quotes: 0*/
    return `<div class="notimatica-reset notimatica-plugin-button">
      <span class="notimatica-plugin-button-content">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           viewBox="0 0 1920 1920" style="enable-background:new 0 0 1920 1920;" xml:space="preserve">
          <path class="notimatica-plugin-button-bell" d="M954,1291.7c-16-0.2-438.2-5.2-438.5,0c-3.5,65.2,55.5,71.4,55.5,71.4h382.5h1H1337c0,0,59.1-6.2,55.5-71.4 C1392.3,1286.5,970,1291.5,954,1291.7z"/>
          <path class="notimatica-plugin-button-bell" d="M859.1,1394.8c5.3,47.6,45.6,84.6,94.6,84.6s89.3-37,94.6-84.6H859.1z"/>
          <path class="notimatica-plugin-button-bell" d="M1232.3,880c-11.5-143.7,19.4-248.6-74.1-290c-45.5-20.2-94.5-29.9-133.2-34.6c-2.2-8.9-8.2-16.5-16.3-21.4
            c7.9-11.1,12.6-24.6,12.6-39.3c0-37.4-30.3-67.7-67.7-67.7s-67.7,30.3-67.7,67.7c0,14.3,4.5,27.6,12.1,38.5
            c-8.8,4.9-15.3,12.9-17.6,22.3C842,560.3,793.8,570,749,589.8c-93.4,41.4-62.6,146.3-74.1,290s-30,269.8-144.6,388.8
            c103.8,0,398-3.2,423.2-3.5c25.2,0.3,319.4,3.5,423.2,3.5C1262.2,1149.7,1243.7,1023.7,1232.3,880z M953.7,463.9
            c17,0,30.9,13.8,30.9,30.9c0,17-13.8,30.9-30.9,30.9c-17,0-30.9-13.8-30.9-30.9C922.8,477.7,936.6,463.9,953.7,463.9z"/>
          <path class="notimatica-plugin-button-wave-1" d="M531.1,1122.1c-48.7-37.7-80.2-96.7-80.2-162.9c0-67.2,32.4-127,82.3-164.5l-38.8-45.6
            c-62.8,48.6-103.3,124.6-103.3,210.2c0,84.2,39.2,159.2,100.4,207.9L531.1,1122.1z"/>
          <path class="notimatica-plugin-button-wave-2" d="M414,1187.7c-56.3-59.7-90.9-140.1-90.9-228.5c0-90,35.9-171.8,94.1-231.9l-39.9-34.4c0,0-1.6-2.7-4-6.4
            c-68.1,70.7-110,166.8-110,272.7c0,105,41.2,200.3,108.3,270.8L414,1187.7z"/>
          <path class="notimatica-plugin-button-wave-1" d="M1380.4,794.5c48.7,37.7,80.2,96.7,80.2,162.9c0,67.2-32.4,127-82.3,164.5l38.8,45.6
            c62.8-48.6,103.3-124.6,103.3-210.2c0-84.2-39.2-159.2-100.4-207.9L1380.4,794.5z"/>
          <path class="notimatica-plugin-button-wave-2" d="M1497.4,728.9c56.3,59.7,90.9,140.1,90.9,228.5c0,90-35.9,171.8-94.1,231.9l39.9,34.4c0,0,1.6,2.7,4,6.4
            c68.1-70.7,110-166.8,110-272.7c0-105-41.2-200.3-108.3-270.8L1497.4,728.9z"/>
        </svg>
      </span>
    </div>`
  }

  /**
   * Get tooltip position from button position.
   *
   * @param  {String} position The button position
   * @return {String}
   */
  getTooltipPosition (position) {
    const map = {
      'bottom-right': 'left',
      'bottom-left': 'right',
      'top-right': 'left',
      'top-left': 'right'
    }

    return map[position]
  }

  /**
   * Prepare plugin.
   *
   * @return {Promise}
   */
  prepare () {
    Notimatica.on('subscribe:success', () => {
      this.subscribed(this.$button)
    })

    Notimatica.on('unsubscribe:success', () => {
      this.unsubscribed(this.$button)
    })

    return fetch(this.options.css)
      .then((response) => {
        if (response.status === 200) {
          return response.text()
            .then((text) => $('<style>')
              .html(text)
              .appendTo(this.options.cssTarget || document.head)
            )
        }
      })
  }

  /**
   * Play widget.
   */
  play () {
    if (this.$button) {
      this.$button.remove()
    }

    this.$button = this.build()
  }

  /**
   * Build element.
   *
   * @return {Object}
   */
  build () {
    const $button = $(this.template)
      .addClass('notimatica-reset notimatica-plugin-button')
      .addClass('notimatica-plugin-button-' + this.options.position)
      .attr('data-balloon-pos', this.getTooltipPosition(this.options.position))
      .on('click', this.options.click)

    Notimatica.isSubscribed()
      ? this.subscribed($button)
      : this.unsubscribed($button)

    $button.appendTo(this.options.target || document.body)

    return $button
  }

  /**
   * If is subscribed.
   *
   * @param {Object} $button The button node
   */
  subscribed ($button) {
    $button
      .removeClass('notimatica-plugin-button-subscribe')
      .addClass('notimatica-plugin-button-unsubscribe')
      .attr('data-balloon', this.options.tooltip.unsubscribe)
  }

  /**
   * If is unsubcribed.
   *
   * @param {Object} position The button node
   */
  unsubscribed ($button) {
    $button
      .removeClass('notimatica-plugin-button-unsubscribe')
      .addClass('notimatica-plugin-button-subscribe')
      .attr('data-balloon', this.options.tooltip.subscribe)
  }
}

export default new Button()
