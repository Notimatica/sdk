import { PROVIDERS_ENDPOINTS } from './defaults'

/**
 * Make token from endpoint.
 * @param {String} endpoint
 * @param {String} provider
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
 * @param {Object} target
 * @param {Object} object
 */
export var merge = function (target, object) {
  for (var i in object) {
    if (object.hasOwnProperty(i)) {
      target[i] = object[i]
    }
  }
}

/**
 * Extend object.
 * @param {Object} object
 */
export var extend = function (object) {
  merge(this, object)
}

/**
 * Get property recursively by 'foo.bar' syntax.
 * @param {String} propertyName
 * @param {Object} object
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
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost'
}
