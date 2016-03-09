import * as api from '../api'

var ServiceWorker = {
  _inited: false,

  init: function () {
    self.addEventListener('install', ServiceWorker.onInstalled)
    self.addEventListener('activate', ServiceWorker.onActivated)
    self.addEventListener('push', ServiceWorker.onPushReceived)
    self.addEventListener('notificationclick', ServiceWorker.onNotificationClicked)

    ServiceWorker._inited = true

    console.log('ServiceWorker inited')
  },

  onInstalled: function (event) {
    self.skipWaiting()
    console.log('Installed', event)
  },

  onActivated: function (event) {
    console.log('Activated', event)
  },

  onPushReceived: function (event) {
    console.log('Push message received', event)

    event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          if (!subscription) {
            return
          }

          console.log(subscription)

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
  },

  onNotificationClicked: function (event) {
    console.log('Notification click: tag ', event.notification.tag)

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
  }
}

ServiceWorker.init()
