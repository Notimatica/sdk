import { VERSION, API_URL, POSTMAN_URL } from './defaults'

/**
 * Common HTTP call.
 *
 * @param  {String} method  HTTP method
 * @param  {String} url     The url to call
 * @param  {Object} data    Data to send
 * @param  {Object} headers Headers to send
 * @param  {Boolean} cors   Uses cors headers
 * @return {Promise}
 */
export const httpCall = function (method, url, data, headers, cors = true) {
  headers = Object.assign({
    'Content-type': 'application/json',
    'Accept': 'application/json'
  }, headers)

  return fetch(url, {
    method,
    headers: cors ? headers : {},
    cache: 'no-cache',
    mode: cors ? 'cors' : 'no-cors',
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.status !== 204 ? response.json() : response.text()
      } else if (response.status === 0) {
        return response.text()
      } else {
        return response.json()
          .then((data) => {
            throw new Error('Api error: ' + data.message)
          })
      }
    })
}

/**
 * Call Notimatica API.
 *
 * @param  {String} method The HTTP method
 * @param  {String} source The API name
 * @param  {String} url    The url
 * @param  {Object} data   Data to send
 * @return {Promise}
 */
export const apiCall = function (method, source, url, data) {
  let domains = {
    api: API_URL,
    postman: POSTMAN_URL
  }

  url = domains[source] + url || source

  return httpCall(method, url, data, { 'X-Notimatica-SDK': VERSION })
}

/**
 * Subscribe to notifications.
 *
 * @param  {String} project Project uuid
 * @param  {Object} data    Data to send
 * @return {Promise}
 */
export const subscribe = function (project, data) {
  return apiCall('post', 'api', `/v1/projects/${project}/subscribers`, data)
}

/**
 * Unsubscribe from notidfications.
 *
 * @param  {String} project Project uuid
 * @param  {Object} data    Data to send
 * @return {Promise}
 */
export const unsubscribe = function (project, data) {
  return apiCall('delete', 'api', `/v1/projects/${project}/subscribers`, data)
}

/**
 * Get notification payload.
 *
 * @param  {String} token The subscriber token
 * @return {Promise}
 */
export const getPayload = function (token) {
  return apiCall('get', 'postman', '/v1/notifications/payload?token=' + encodeURIComponent(token))
    .then(res => res.payload)
}

/**
 * Get url to open on click.
 *
 * @param  {String} notification The notification uuid
 * @return {Promise}
 */
export const getRedirect = function (notification) {
  return apiCall('get', 'postman', '/v1/notifications/url?notification=' + encodeURIComponent(notification))
    .then(res => res.url)
}
