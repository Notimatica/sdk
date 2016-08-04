import { merge, findNode, createNode } from '../utils'

module.exports = class AbstractPlugin {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor () {
    this.options = {}

    Notimatica.emit('plugin:ready', this)
  }

  /**
   * Prepare to init.
   *
   * @return {Promise}
   */
  prepare () {
    return new Promise(function (resolve) { resolve() })
  }

  /**
   * Ready.
   *
   * @return {Promise}
   */
  init (options) {
    this.options = merge(this.defaults, options)

    if (this.options.autorun === undefined || this.options.autorun === true) {
      return this.prepare()
        .then(() => this.injectCss())
        .then(() => this.injectTemplate())
        .then(() => this.play())
        .catch((err) => Notimatica.emit('error', err))
    } else {
      return this.prepare()
    }
  }

  /**
   * Inject plugin's css into dom.
   *
   * @return {Promise}
   */
  injectCss () {
    return fetch(this.options.css)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`Can't load ${this.name} plugin css: ${this.options.css}`)
        }

        return response.text()
      })
      .then((css) => {
        const target = findNode(this.options.cssTarget, document.head)
        const style = document.createElement('style')
        style.textContent = css
        target.appendChild(style)
      })
  }

  /**
   * Inject plugin's template.
   */
  injectTemplate () {
    if (this.template && this.options.target) {
      const target = findNode(this.options.target, document.body)
      this.$wrapper = createNode(this.template)
      target.appendChild(this.$wrapper)
    }
  }
}
