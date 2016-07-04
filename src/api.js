import { API_URL, POSTMAN_URL } from './defaults'

const empty = []
let Notimatica = Notimatica || {
  emit (event) {
    const method = event === 'api:call' ? 'log' : 'error'

    console[method].apply(console, empty.slice.call(arguments, 1))
  }
}

const apiCall = function (source, method, url, data) {
  let headers = {
    'Content-type': 'application/json',
    'Accept': 'application/json'
  }

  let domains = {
    api: API_URL,
    postman: POSTMAN_URL
  }

  Notimatica.emit('api:call', method, url, data)

  return fetch(domains[source] + url, {
    method,
    headers,
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.status !== 204 ? response.json() : response.text()
      } else {
        return response.json()
          .then((data) => {
            Notimatica.emit('api:fail', response.status, data)
            throw new Error('Api error: ' + data.message)
          })
      }
    })
}

export const subscribe = function (project, data) {
  return apiCall('api', 'post', '/v1/projects/' + project + '/subscribers', data)
}

export const unsubscribe = function (project, data) {
  return apiCall('api', 'delete', '/v1/projects/' + project + '/subscribers', data)
}

export const getPayload = function (token) {
  return apiCall('postman', 'get', '/v1/notifications/payload?token=' + encodeURIComponent(token))
}
