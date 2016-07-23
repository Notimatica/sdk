import { VERSION, API_URL, POSTMAN_URL } from './defaults'

export const httpCall = function (method, url, data, headers) {
  headers = Object.assign({
    'Content-type': 'application/json',
    'Accept': 'application/json'
  }, headers)

  return fetch(url, {
    method,
    headers,
    cache: 'no-cache',
    body: JSON.stringify(data)
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.status !== 204 ? response.json() : response.text()
      } else {
        return response.json()
          .then((data) => {
            throw new Error('Api error: ' + data.message)
          })
      }
    })
}

export const apiCall = function (source, method, url, data) {
  let domains = {
    api: API_URL,
    postman: POSTMAN_URL
  }

  return httpCall(method, domains[source] + url, data, { 'X-Notimatica-SDK': VERSION })
}

export const subscribe = function (project, data) {
  return apiCall('api', 'post', `/v1/projects/${project}/subscribers`, data)
}

export const unsubscribe = function (project, data) {
  return apiCall('api', 'delete', `/v1/projects/${project}/subscribers`, data)
}

export const sendTestMessage = function (project, data) {
  return apiCall('api', 'post', `/v1/projects/${project}/notifications`, data)
}

export const getPayload = function (token) {
  return apiCall('postman', 'get', '/v1/notifications/payload?token=' + encodeURIComponent(token))
}
