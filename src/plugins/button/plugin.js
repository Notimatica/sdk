require('./button.scss')

import Vue from 'vue'
import AbstractPlugin from '../abstract'
import FloatingButton from './Button'

class Plugin extends AbstractPlugin {
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
      target: 'body',
      css: Notimatica.options.sdkPath + '/notimatica-button.css',
      cssTarget: 'head',
      position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
      usePopover: true,
      click: () => {
        Notimatica.emit('plugin:button:clicked')

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
        'button.popover.subscribe': "Do you want to receive notifications from us? Click Subscribe!",
        'button.popover.unsubscribe': "Don't want to recieve notifications anymore? Click Unsubscribe.",
        'button.popover.button.subscribe': 'Subscribe',
        'button.popover.button.unsubscribe': 'Unsubscribe',
        'button.popover.button.cancel': 'Later',
        'button.tooltip.subscribe': 'Subscribe to notifications',
        'button.tooltip.unsubscribe': 'Unsubscribe from notifications',
        'button.tooltip.message': 'New notifocation'
      },
      'ru': {
        'button.popover.subscribe': "Хотите получать уведомления от {project}? Нажмите Подписаться!",
        'button.popover.unsubscribe': "Не хотите больше получать уведомления? Нажмите Отписаться.",
        'button.popover.button.subscribe': 'Подписаться',
        'button.popover.button.unsubscribe': 'Отписаться',
        'button.popover.button.cancel': 'Позже',
        'button.tooltip.subscribe': 'Подписаться на уведомления',
        'button.tooltip.unsubscribe': 'Отписаться от уведомлений',
        'button.tooltip.message': 'Новое уведомление'
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
    return `<div class="notimatica-reset notimatica-plugin-wrapper notimatica-plugin-button-wrapper">
      <floating-button :position="position" :use-popover="usePopover" :click="click"></floating-button>
    </div>`
  }

  /**
   * Prepare to init.
   *
   * @return {Promise}
   */
  prepare () {
    return new Promise((resolve) => {
      // Disable native autoSubscribe as we will handle it by ourselfs
      Notimatica.off('autoSubscribe:start')

      resolve()
    })
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
    Vue.config.debug = true

    return new Vue({
      el: '.notimatica-plugin-button-wrapper',
      data: {
        position: this.options.position,
        usePopover: this.options.usePopover,
        click: this.options.click
      },
      components: {
        FloatingButton
      }
    })
  }
}

export default new Plugin()
