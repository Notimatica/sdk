import { PROVIDERS_ENDPOINTS } from './defaults'

/**
 * If varible is string.
 *
 * @param  {*}  el The varible
 * @return {Boolean}
 */
export function isString (varible) {
  return typeof varible === 'string'
}

/**
 * If varible is object.
 *
 * @param  {*}  el The varible
 * @return {Boolean}
 */
export function isObject (varible) {
  return varible instanceof Object
}

/**
 * If varible is function.
 *
 * @param  {*}  el The varible
 * @return {Boolean}
 */
export function isFunction (varible) {
  return ({}).toString.call(varible) === '[object Function]'
}

/**
 * If varible is array.
 *
 * @param  {*}  el The varible
 * @return {Boolean}
 */
export function isArray (varible) {
  return Array.isArray(varible)
}

/**
 * Make token from endpoint.
 *
 * @param   {String} endpoint The endpoint string
 * @param   {String} provider The provider name
 * @returns {String}
 */
export function makeToken (endpoint, provider) {
  if (provider === undefined || PROVIDERS_ENDPOINTS[provider] === undefined) {
    return endpoint
  }

  return endpoint.trim().replace(new RegExp('^(' + PROVIDERS_ENDPOINTS[provider] + ')'), '')
}

/**
 * Merges two (or more) objects, giving the last one precedence.
 *
 * @param {Object} target The target object
 * @param {Object} source The source object
 */
export function merge (target, source) {
  if (!isObject(target)) {
    target = {}
  }

  for (let property in source) {
    if (source.hasOwnProperty(property)) {
      var sourceProperty = source[property]

      if (isObject(sourceProperty)) {
        target[property] = merge(target[property], sourceProperty)
        continue
      }

      target[property] = sourceProperty
    }
  }

  for (var a = 2, l = arguments.length; a < l; a++) {
    merge(target, arguments[a])
  }

  return target
}

/**
 * Extend object.
 *
 * @param {Object} object
 */
export function extend (object) {
  merge(this, object)
}

/**
 * Get property recursively by 'foo.bar' syntax.
 *
 * @param   {String} propertyName The property name
 * @param   {Object} object       The object
 * @returns {*}
 */
export function getProperty (propertyName, object) {
  if (propertyName === undefined) {
    return object
  }

  var parts = propertyName.split('.')
  var length = parts.length
  var property = object || this

  for (var i = 0; i < length; i++) {
    if (property[parts[i]] === undefined) {
      throw new Error(propertyName + ' is undefined')
    }
    property = property[parts[i]]
  }

  return property
}

/**
 * If site is under https.
 *
 * @return {Boolean}
 */
export function isHttps () {
  if (typeof window === 'undefined') return false

  return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}

/**
 * Simple find in DOM helper
 *
 * @param  {String|Object} element  The element to search
 * @param  {Object}        fallback Fallback element
 * @return {Object}
 */
export function findNode (element, fallback) {
  switch (true) {
    case isString(element):
      try {
        return document.querySelectAll(element)
      } catch (e) {}

      return fallback
    case element.nodeType:
      return element
    default:
      return fallback
  }
}

/**
 * Create DOM node by html string
 * @param  {String} html The html string
 * @return {Object}
 */
export function createNode (html) {
  const frag = document.createDocumentFragment()
  const temp = document.createElement('div')

  temp.innerHTML = html
  while (temp.firstChild) {
    frag.appendChild(temp.firstChild)
  }

  return frag
}

/**
 * Return text string. Used for strings overriding.
 *
 * @param  {String} string String id.
 * @return {String}
 */
export function t (string) {
  const lang = Notimatica.visitor.env.language

  return typeof Notimatica.strings[lang][string] !== 'undefined'
    ? Notimatica.strings[lang][string]
    : typeof Notimatica.strings[Notimatica.options.defaultLocale][string] !== 'undefined'
      ? Notimatica.strings[Notimatica.options.defaultLocale][string]
      : string
}
