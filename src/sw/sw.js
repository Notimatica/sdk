import log from 'loglevel'
import { getPayload } from '../api'
import { makeToken } from '../utils'

var ServiceWorker = {
  _inited: false,

  init: function () {
    self.addEventListener('install', ServiceWorker.onInstalled)
    self.addEventListener('activate', ServiceWorker.onActivated)
    self.addEventListener('push', ServiceWorker.onPushReceived)
    self.addEventListener('notificationclick', ServiceWorker.onNotificationClicked)

    ServiceWorker._inited = true

    log.debug('ServiceWorker inited')
  },

  onInstalled: function (event) {
    self.skipWaiting()
    log.debug('Installed', event)
  },

  onActivated: function (event) {
    log.debug('Activated', event)
  },

  onPushReceived: function (event) {
    log.debug('Push message received', event)

    return event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          if (!subscription) {
            return
          }

          log.debug(subscription)

          const token = makeToken(subscription.endpoint)
          return getPayload(token)
            .then((res) => {
              log.debug(res)
              return self.registration.showNotification(res.payload.title, {
                body: res.payload.body,
                icon: res.payload.icon,
                tag: res.payload.tag,
                data: {
                  url: res.payload.url
                }
              })
            })
            .catch((err) => {
              log.debug(err)
            })
        })
    )
  },

  onNotificationClicked: function (event) {
    log.debug('Notification click: tag ', event.notification.tag)

    const url = event.notification.data.url

    event.notification.close()

    if (url) {
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
    }
  }
}

ServiceWorker.init()
