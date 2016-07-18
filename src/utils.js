import { PROVIDERS_ENDPOINTS } from './defaults'

/**
 * Make token from endpoint.
 *
 * @param   {String} endpoint The endpoint string
 * @param   {String} provider The provider name
 * @returns {String}
 */
export var makeToken = function (endpoint, provider) {
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
 * Merge objects.
 *
 * @param {Object} target The target object
 * @param {Object} source The source object
 */
export var merge = function (target, source) {
  /* Merges two (or more) objects,
   giving the last one precedence */

  if (typeof target !== 'object') {
    target = {}
  }

  for (let property in source) {
    if (source.hasOwnProperty(property)) {
      var sourceProperty = source[property]

      if (typeof sourceProperty === 'object') {
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
export var extend = function (object) {
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
