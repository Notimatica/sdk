import * as env from './env'
import log from 'loglevel'

export const apiCall = function (apiId, method, url, data) {
  log.info('Api call', apiId, method, url, data)
  return fetch(env.API_URL + url, {
    method: method,
    headers: {
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Notimatica apiId="' + apiId + '"'
    },
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
  return apiCall(apiId, 'post', '/projects/subscribe', { endpoint })
}

export const getPayload = function (apiId, endpoint) {
  return apiCall(apiId, 'get', '/push/payload?endpoint=' + encodeURIComponent(endpoint))
}
