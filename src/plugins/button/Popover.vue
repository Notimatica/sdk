<template>
  <div class="notimatica-popover fade" :class="{in: in && popover.body}">
    <div class="notimatica-popover-title" v-if="popover.title">{{ popover.title }}</div>
    <div class="notimatica-popover-content">{{{ popover.body }}}</div>
    <div class="notimatica-popover-close" @click="hide">x</div>
  </div>
</template>

<script>
export default {
  props: ['position'],
  data () {
    return {
      in: false,
      popover: {
        title: '',
        body: ''
      }
    }
  },
  ready () {
    Notimatica.emit('popover:ready')
  },
  methods: {
    /**
     * Set message.
     *
     * @param  {String} title The title
     * @param  {String} body  The body
     */
    message (title, body) {
      this.popover = { title, body }
    },

    /**
     * Show popover.
     */
    show () {
      this.in = true
    },

    /**
     * Hide popover.
     */
    hide () {
      this.in = false
      this.popover.title = ''
      this.popover.body = ''
      this.$parent.counter = 0
    }
  }
}
