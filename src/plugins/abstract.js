import merge from 'deepmerge'
import { findNode, createNode } from '../utils'

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
   * Ready.
   *
   * @return {Promise}
   */
  init (options) {
    this.options = merge(this.defaults, options)

    return this.prepare()
      .then(() => this.injectCss())
      .then(() => this.injectTemplate())
      .then(() => this.play())
      .catch((err) => Notimatica.emit('error', err))
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
    for (let node of findNode('.notimatica-plugin-wrapper')) {
      node.remove()
    }

    this.cssWrapper.remove()
  }
}
