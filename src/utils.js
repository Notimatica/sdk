import { PROVIDERS_ENDPOINTS, LOCALE } from './defaults'

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
 * Return Part of the string after search.
 *
 * @param  {String} string Hystack
 * @param  {String} search Needle
 * @return {String}
 */
export function strAfter (string, search) {
  return string.substr(string.indexOf(search) + search.length)
}

/**
 * Convert key-value object to escaped query string.
 *
 * @param  {Object} params Params
 * @return {String}
 */
export function toQueryString (params, glue = '&') {
  const esc = encodeURIComponent

  return Object.keys(params)
    .map((key) => {
      let query = esc(key)
      if (isString(params[key])) return `${query}=${esc(params[key])}`
      if (isArray(params[key])) return params[key].map((value) => `${query}[]=${esc(value)}`).join(glue)
    })
    .join(glue)
}

/**
 * Make token from endpoint.
 *
 * @param   {String} endpoint The endpoint string
 * @param   {String} provider The provider name
 * @returns {String}
 */
export function makeToken (endpoint, provider) {
  let urls = []

  if (provider !== undefined && PROVIDERS_ENDPOINTS[provider] !== undefined) {
    urls.push(PROVIDERS_ENDPOINTS[provider])
  } else {
    for (let key in PROVIDERS_ENDPOINTS) {
      if (PROVIDERS_ENDPOINTS.hasOwnProperty(key)) {
        urls.push(PROVIDERS_ENDPOINTS[key])
      }
    }
  }

  return endpoint.replace(new RegExp('^(' + urls.join('|') + ')'), '')
}

/**
 * Filter object by predicate function.
 *
 * @param  {Object} object      The object
 * @param  {Function} predicate The predicate function
 * @return {Object}
 */
export function filterObject (object, predicate) {
  return Object.keys(object)
        .filter((key) => predicate(object[key]))
        .reduce((res, key) => {
          res[key] = object[key]

          return res
        }, {})
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
 * Leave only unique items in array.
 *
 * @param  {Array} source The source array
 * @return {Array}
 */
export function unique (source) {
  let uniqueMap = {}
  let array = []

  for (var i = 0, l = source.length; i < l; ++i) {
    if (uniqueMap.hasOwnProperty(source[i])) {
      continue
    }

    array.push(source[i])
    uniqueMap[source[i]] = 1
  }

  return array
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
 * If document is ready.
 *
 * @param {Function} callback The document ready callback
 */
export function documentReady (callback) {
  if (document.readyState !== 'loading') {
    callback()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', () => {
      callback()
    })
  } else {
    document.attachEvent('onreadystatechange', () => {
      if (document.readyState !== 'loading') {
        callback()
      }
    })
  }
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
        return document.querySelectorAll(element)
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
 * Get query parameter.
 *
 * @param  {[type]} name [description]
 * @param  {[type]} url  [description]
 * @return {[type]}
 */
export function getQueryParameter (name, url) {
  if (!url) url = window.location.href

  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)

  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 * Get visitor locale.
 *
 * @return {String}
 */
export function locale () {
  function localeExist (l) {
    return typeof Notimatica.strings[l] !== 'undefined'
  }

  return localeExist(Notimatica.options.locale)
    ? Notimatica.options.locale
    : localeExist(Notimatica.visitor.env.language)
      ? Notimatica.visitor.env.language
      : LOCALE
}

/**
 * Return text string. Used for strings overriding.
 *
 * @param  {String} string String id.
 * @return {String}
 */
export function t (string) {
  const l = locale()

  return typeof Notimatica.strings[l][string] !== 'undefined'
    ? Notimatica.strings[l][string]
    : string
}
