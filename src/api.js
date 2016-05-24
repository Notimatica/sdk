import log from 'loglevel'
import { API_URL, POSTMAN_URL } from './defaults'

const apiCall = function (source, method, url, data) {
  let headers = {
    'Content-type': 'application/json',
    'Accept': 'application/json'
  }

  let domains = {
    api: API_URL,
    postman: POSTMAN_URL
  }

  log.info('Api call', method, url, data)

  return fetch(domains[source] + url, {
    method,
    headers,
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      } else {
        return Promise.reject(response)
      }
    })
    .catch((err) => {
      log.trace(err)
    })
}

export const subscribe = function (project, data) {
  return apiCall('api', 'post', '/v1/projects/' + project + '/subscribers', data)
}

export const getPayload = function (token) {
  return apiCall('postman', 'get', '/v1/notifications/payload?token=' + encodeURIComponent(token))
}
