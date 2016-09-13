require('./prompt.scss')

import $ from 'jbone'
import AbstractPlugin from '../abstract'
import { t } from '../../utils'

class Plugin extends AbstractPlugin {
  /**
   * Plugin name.
   *
   * @return {String}
   */
  get name () {
    return 'prompt'
  }

  /**
   * Default options.
   *
   * @return {Object}
   */
  get defaults () {
    return {
      target: 'body',
      css: Notimatica.options.sdkPath + '/notimatica-prompt.css',
      cssTarget: 'head',
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
        'prompt.subscribe': "Do you want to receive notifications from us? Click Subscribe!",
        'prompt.button.subscribe': 'Subscribe',
        'prompt.button.cancel': 'Later'
      },
      'ru': {
        'prompt.subscribe': "Хотите получать уведомления от нас? Нажмите Подписаться!",
        'prompt.button.subscribe': 'Подписаться',
        'prompt.button.cancel': 'Позже'
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
    return `<div class="notimatica-reset notimatica-plugin-wrapper notimatica-plugin-prompt-wrapper">
      <div class="notimatica-prompt notimatica-subscribe notimatica-fade">
          <div class="notimatica-prompt-content">
            ${t('prompt.subscribe')}
          </div>
          <div class="notimatica-prompt-footer">
            <button class="notimatica-pull-left notimatica-common-button notimatica-common-button-action">${t('prompt.button.subscribe')}</button>
            <button class="notimatica-pull-right notimatica-common-button notimatica-common-button-link">${t('prompt.button.cancel')}</button>
            <div class="clearfix"></div>
          </div>
        </div>
      </div>
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

      Notimatica.on('autoSubscribe:start', () => {
        $('.notimatica-prompt').addClass('in')
      })

      Notimatica.on('user:interact', () => {
        $('.notimatica-prompt').addClass('in')
      })

      resolve()
    })
  }

  /**
   * Play widget.
   */
  play () {
    $('button.notimatica-common-button-action', '.notimatica-prompt-footer').on('click', () => {
      this._hide()
      this.options.click()
    })

    $('button.notimatica-common-button-link', '.notimatica-prompt-footer').on('click', () => {
      this._hide()
    })
  }

  /**
   * Hide prompt.
   */
  _hide () {
    $('.notimatica-prompt').removeClass('in')
    Notimatica.disableAutoSubscribe()
  }
}

export default new Plugin()
