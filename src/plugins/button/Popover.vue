<template>
  <div class="notimatica-popover fade" :class="{'in': in}">
    <div v-if="message.body">
      <div class="notimatica-popover-title" v-if="message.title">{{ popover.title }}</div>
      <div class="notimatica-popover-content">{{{ popover.body }}}</div>
    </div>
    <div v-else>
      <div class="notimatica-popover-title" v-if="message.title">{{ texts.subscribe }}</div>
      <div class="notimatica-popover-content">{{ texts.subscribe }}</div>
    </div>
    <div class="notimatica-popover-close" @click="hide">&times;</div>
  </div>
</template>

<script>
export default {
  props: ['position', 'texts'],
  data () {
    return {
      in: false,
      message: {
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
