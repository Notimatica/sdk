import * as utils from '../utils'
import * as api from '../api'

import log from 'loglevel'

var ServiceWorker = function (options) {
  this.options = {}

  console.log('123sdf');

  this._inited = false

  utils.merge(this.options, options)
}

ServiceWorker.prototype.init = function () {
  console.log('123');
  self.addEventListener('install', ServiceWorker.onInstalled)
  self.addEventListener('activate', ServiceWorker.onActivated)
  self.addEventListener('push', ServiceWorker.onPushReceived)
  self.addEventListener('notificationclick', ServiceWorker.onNotificationClicked)
}

ServiceWorker.prototype.onInstalled = function (event) {
  self.skipWaiting()
  log.info('Installed', event)
}

ServiceWorker.prototype.onActivated = function (event) {
  log.info('Activated', event)
}

ServiceWorker.prototype.onPushReceived = function (event) {
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
}

ServiceWorker.prototype.onNotificationClicked = function (event) {
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
}

var serviceWorker = new ServiceWorker()
serviceWorker.init()
