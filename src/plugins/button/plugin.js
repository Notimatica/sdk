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
      usePopover: true,
      click: () => {
        Notimatica.isSubscribed()
          ? Notimatica.unsubscribe()
          : Notimatica.subscribe()
      }
    }
  }

  /**
   * Default strings.
   *
   * @return {Object}
   */
  get strings () {
    return {
      'en': {
        'popover.subscribe': "Do you want to recieve desktop notifications from our site? Click Subscribe button!",
        'popover.unsubscribe': "If you don't want to recieve notifications anymore, click Unsubscribe button.",
        'popover.button.subscribe': 'Subscribe',
        'popover.button.unsubscribe': 'Unsubscribe',
        'tooltip.subscribe': 'Subscribe to notifications',
        'tooltip.unsubscribe': 'Unsubscribe from notifications',
        'tooltip.message': 'There is a message for you'
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
      <button :position="position" :use-popover="usePopover" :click="click"></button>
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
        usePopover: this.options.usePopover,
        click: this.options.click
      },
      components: {
        Button
      }
    })
  }
}

export default new Plugin()
