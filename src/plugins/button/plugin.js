require('./button.scss')

import Vue from 'vue'
import AbstractPlugin from '../abstract'
import Button from './Button'

const Plugin = class Plugin extends AbstractPlugin {
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
      autorun: true,
      target: 'body',
      css: this.options.sdkPath + '/notimatica-button.css',
      cssTarget: 'head',
      position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
      popover: true,
      tooltip: {
        subscribe: 'Subscribe to notifications?',
        unsubscribe: 'Unsubscribe from notifications?',
        message: 'We have a message for you'
      },
      click: () => {
        Notimatica.isSubscribed()
          ? Notimatica.unsubscribe()
          : Notimatica.subscribe()
      }
    }
  }

  /**
   * Widget template.
   *
   * @return {String}
   */
  get template () {
    /*eslint quotes: 0*/
    return `<div class="notimatica-reset notimatica-plugin-button-wrapper notimatica-plugin-button-${this.options.position}">
      <button :position="position" :tooltip="tooltip" :popover="popover" :click="click"></button>
    </div>`
  }

  /**
   * Return target node.
   *
   * @return {Object}
   */
  get target () {
    return this.$vue
  }

  /**
   * Play widget.
   */
  play () {
    this.$vue = this.$vue || this.build()
  }

  /**
   * Build element.
   *
   * @return {Object}
   */
  build () {
    return new Vue({
      el: '.notimatica-plugin-button-wrapper',
      data: {
        position: this.options.position,
        tooltip: this.options.tooltip,
        popover: this.options.popover,
        click: this.options.click
      },
      components: {
        Button
      }
    })
  }
}

export default new Plugin()
