import * as vars from './vars'

export const apiCall = function (method, url, data) {
  return fetch(vars.API_URL + url, {
    method: method,
    headers: {
      'Content-type': 'application/json',
      'Authorization': 'Basic ' + btoa(this.options.apiId + ':' + 'foo')
    },
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
      }
    })
      .then((response) => {
        return response.json()
      })
}

export const subscribe = function (endpoint) {
  return this.apiCall('post', '/push/subscribe', { endpoint })
}

export const getPayload = function (endpoint) {
  return this.apiCall('get', '/push/payload?endpoint=' + encodeURIComponent(endpoint))
}
