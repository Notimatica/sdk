import * as utils from '../utils'
import * as api from '../api'
import log from 'loglevel'

var Notimatica = function (options) {
  const defaults = {}

  this._inited = false

  this.options = utils.merge(defaults, options)
}

log.info('Started', self)
self.addEventListener('install', (event) => {
  self.skipWaiting()
  log.info('Installed', event)
})
self.addEventListener('activate', (event) => {
  log.info('Activated', event)
})
self.addEventListener('push', (event) => {
  log.info('Push message received', event)

  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then((subscription) => {
        if (!subscription) {
          return
        }

        log.info(subscription)

        return api.getPayload(subscription.endpoint)
          .then((res) => {
            self.registration.showNotification(res.title, {
              body: res.body,
              icon: res.icon,
              tag: res.tag,
              data: {
                url: res.url
              }
            })
          })
      })
  )
})

self.addEventListener('notificationclick', (event) => {
  log.info('Notification click: tag ', event.notification.tag)

  const url = event.notification.data.url

  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i]
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

module.exports = Notimatica
