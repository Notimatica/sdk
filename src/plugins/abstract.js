import { merge, findNode, createNode } from '../utils'

module.exports = class AbstractPlugin {
  /**
   * Constructor.
   *
   * @param  {Object} options Options
   */
  constructor () {
    this.options = {}
    this.wrapper = null
    this.cssWrapper = null

    Notimatica.emit('plugin:ready', this)
  }

  /**
   * Prepare to init.
   *
   * @return {Promise}
   */
  prepare () {
    return Promise.resolve()
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
    if (this.options.css) {
      return fetch(this.options.css)
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`Can't load ${this.name} plugin css: ${this.options.css}`)
          }

          return response.text()
        })
        .then((css) => {
          const target = findNode(this.options.cssTarget, document.head)[0]
          this.cssWrapper = document.createElement('style')
          this.cssWrapper.textContent = css
          target.appendChild(this.cssWrapper)
        })
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Inject plugin's template.
   */
  injectTemplate () {
    if (this.template) {
      const target = findNode(this.options.target, document.body)[0]
      this.wrapper = target.appendChild(createNode(this.template))
    }
  }

  /**
   * Destroy plugin.
   */
  destroy () {
    findNode('.notimatica-plugin-wrapper')
      .forEach((node) => node.remove())
    this.cssWrapper.remove()
  }
}
