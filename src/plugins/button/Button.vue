<template>
  <div
    :class="[
      buttonPosition,
      {
        'notimatica-unsubscribe': subscribed,
        'notimatica-subscribe': !subscribed,
        'notimatica-button-acting': acting
      }
    ]">
    <div
      class="notimatica-button"
      :data-balloon-pos="tooltipPosition"
      :data-balloon="tooltipMessage"
      @click="processClick">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 1920 1920" xml:space="preserve">
        <path class="notimatica-button-bell" d="M954,1291.7c-16-0.2-438.2-5.2-438.5,0c-3.5,65.2,55.5,71.4,55.5,71.4h382.5h1H1337c0,0,59.1-6.2,55.5-71.4 C1392.3,1286.5,970,1291.5,954,1291.7z"/>
        <path class="notimatica-button-bell" d="M859.1,1394.8c5.3,47.6,45.6,84.6,94.6,84.6s89.3-37,94.6-84.6H859.1z"/>
        <path class="notimatica-button-bell" d="M1232.3,880c-11.5-143.7,19.4-248.6-74.1-290c-45.5-20.2-94.5-29.9-133.2-34.6c-2.2-8.9-8.2-16.5-16.3-21.4
          c7.9-11.1,12.6-24.6,12.6-39.3c0-37.4-30.3-67.7-67.7-67.7s-67.7,30.3-67.7,67.7c0,14.3,4.5,27.6,12.1,38.5
          c-8.8,4.9-15.3,12.9-17.6,22.3C842,560.3,793.8,570,749,589.8c-93.4,41.4-62.6,146.3-74.1,290s-30,269.8-144.6,388.8
          c103.8,0,398-3.2,423.2-3.5c25.2,0.3,319.4,3.5,423.2,3.5C1262.2,1149.7,1243.7,1023.7,1232.3,880z M953.7,463.9
          c17,0,30.9,13.8,30.9,30.9c0,17-13.8,30.9-30.9,30.9c-17,0-30.9-13.8-30.9-30.9C922.8,477.7,936.6,463.9,953.7,463.9z"/>
        <path class="notimatica-button-wave-1" d="M531.1,1122.1c-48.7-37.7-80.2-96.7-80.2-162.9c0-67.2,32.4-127,82.3-164.5l-38.8-45.6
          c-62.8,48.6-103.3,124.6-103.3,210.2c0,84.2,39.2,159.2,100.4,207.9L531.1,1122.1z"/>
        <path class="notimatica-button-wave-2" d="M414,1187.7c-56.3-59.7-90.9-140.1-90.9-228.5c0-90,35.9-171.8,94.1-231.9l-39.9-34.4c0,0-1.6-2.7-4-6.4
          c-68.1,70.7-110,166.8-110,272.7c0,105,41.2,200.3,108.3,270.8L414,1187.7z"/>
        <path class="notimatica-button-wave-1" d="M1380.4,794.5c48.7,37.7,80.2,96.7,80.2,162.9c0,67.2-32.4,127-82.3,164.5l38.8,45.6
          c62.8-48.6,103.3-124.6,103.3-210.2c0-84.2-39.2-159.2-100.4-207.9L1380.4,794.5z"/>
        <path class="notimatica-button-wave-2" d="M1497.4,728.9c56.3,59.7,90.9,140.1,90.9,228.5c0,90-35.9,171.8-94.1,231.9l39.9,34.4c0,0,1.6,2.7,4,6.4
          c68.1-70.7,110-166.8,110-272.7c0-105-41.2-200.3-108.3-270.8L1497.4,728.9z"/>
      </svg>
      <div class="notimatica-button-counter" :class="{in: counter > 0}">{{ counter }}</div>
    </div>

    <div class="notimatica-popover notimatica-fade" :class="{'in': popoverActive}" v-if="usePopover || counter > 0">
      <div v-if="counter > 0">
        <div class="notimatica-popover-title" v-if="message.title">{{ message.title }}</div>
        <div class="notimatica-popover-content">{{{ message.body }}}</div>
        <div class="notimatica-clearfix"></div>
      </div>
      <div v-else>
        <div class="notimatica-popover-content">
          {{{ popoverMessage }}}
        </div>
        <div class="notimatica-popover-footer">
          <button
            @click="click"
            class="notimatica-pull-left notimatica-common-button notimatica-common-button-action">
            {{ popoverButtonAction }}
          </button>
          <button
            @click="cancel"
            class="notimatica-pull-right notimatica-common-button notimatica-common-button-link">
            {{ popoverButtonCancel }}
          </button>
          <div class="notimatica-clearfix"></div>
        </div>
      </div>
      <div class="notimatica-popover-close" @click="hidePopover">&times;</div>
    </div>
  </div>
</template>

<script>
require('./button.scss')

import { t } from '../../utils'

export default {
  props: ['position', 'usePopover', 'click'],
  data () {
    return {
      acting: false,
      subscribed: false,
      counter: 0,
      message: {
        tilte: '',
        body: ''
      },
      popoverActive: false
    }
  },
  ready () {
    Notimatica.on('subscribe:do', () => {
      this.processClick()
    })
    Notimatica.on('subscribe:start', () => {
      this.hidePopover()
      this.acting = true
    })
    Notimatica.on('subscribe:success', () => {
      this.subscribed = true
      this.acting = false
    })

    Notimatica.on('subscribe:fail', () => {
      this.acting = false
      this.setMessage('Subscription failed.', 'Subscription failed for some reason. Please, try again later.')
    })

    Notimatica.on('subscribe:cancel', () => {
      this.acting = false
    })

    Notimatica.on('unsubscribe:do', () => {
      this.processClick()
    })
    Notimatica.on('unsubscribe:start', () => {
      this.hidePopover()
      this.acting = true
    })
    Notimatica.on('unsubscribe:success', () => {
      this.subscribed = false
      this.acting = false
    })

    Notimatica.on('user:interact', (title, body) => {
      this.setMessage(title, body)
    })

    Notimatica.on('popover:hide', () => {
      this.hidePopover()
    })

    this.subscribed = Notimatica.isSubscribed()

    Notimatica.emit('button.button:ready')
  },
  computed: {
    /**
     * Button position class.
     *
     * @return {String}
     */
    buttonPosition () {
      return `notimatica-button-${this.position}`
    },

    /**
     * Get tooltip position from button position.
     *
     * @return {String}
     */
    tooltipPosition () {
      const map = {
        'bottom-right': 'left',
        'bottom-left': 'right',
        'top-right': 'left',
        'top-left': 'right'
      }

      return map[this.position]
    },

    /**
     * Get tooltip message.
     *
     * @return {String}
     */
    tooltipMessage () {
      return this.counter > 0
        ? t('button.tooltip.message')
        : this.subscribed
          ? t('button.tooltip.unsubscribe')
          : t('button.tooltip.subscribe')
    },

    /**
     * Get popover message.
     *
     * @return {String}
     */
    popoverMessage () {
      return this.subscribed
        ? t('button.popover.unsubscribe')
        : t('button.popover.subscribe')
    },

    /**
     * Get action popover button.
     *
     * @return {String}
     */
    popoverButtonAction () {
      return this.subscribed
        ? t('button.popover.button.unsubscribe')
        : t('button.popover.button.subscribe')
    },

    /**
     * Get cancel popover button.
     *
     * @return {String}
     */
    popoverButtonCancel () {
      return t('button.popover.button.cancel')
    }
  },
  methods: {
    /**
     * Process button click.
     */
    processClick () {
      if (this.usePopover || this.counter > 0) {
        this.showPopover()
      } else {
        this.click()
      }
    },

    /**
     * Process button click.
     */
    cancel () {
      this.hidePopover()
      Notimatica.disableAutoSubscribe()
    },

    /**
     * Set message.
     *
     * @param  {String} title The title
     * @param  {String} body  The body
     */
    setMessage (title, body) {
      this.message = { title, body }
      this.counter = 1
    },

    /**
     * Show popover.
     */
    showPopover () {
      this.popoverActive = true
    },

    /**
     * Hide popover.
     */
    hidePopover () {
      this.popoverActive = false

      if (this.counter > 0) {
        this.counter = 0

        this.message.title = ''
        this.message.body = ''
      }
    }
  }
}
