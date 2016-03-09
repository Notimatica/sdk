import * as env from './env'
import log from 'loglevel'

export const apiCall = function (method, url, data, apiId) {
  log.info('Api call', method, url, data, apiId || 'unauthorized')

  let headers = {
    'Content-type': 'application/json',
    'Accept': 'application/json'
  }

  if (apiId !== undefined) {
    headers['Authorization'] = 'Notimatica apiId="' + apiId + '"'
  }

  return fetch(env.API_URL + url, {
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
}

export const subscribe = function (apiId, endpoint) {
  return apiCall('post', '/projects/subscribe', { endpoint }, apiId)
}

export const getPayload = function (endpoint) {
  return apiCall('get', '/push/payload?endpoint=' + encodeURIComponent(endpoint))
}
