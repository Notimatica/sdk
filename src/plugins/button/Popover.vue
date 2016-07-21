<template>
  <div class="notimatica-popover fade" :class="{in: popover.body}">
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
      show: false,
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
     * Show popover.
     *
     * @param  {String} title The title
     * @param  {String} body  The body
     */
    show (title, body) {
      this.popover = { title, body }
    },

    /**
     * Hide popover.
     */
    hide () {
      this.popover.title = ''
      this.popover.body = ''
    }
  }
}
