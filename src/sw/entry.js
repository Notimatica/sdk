import { getPayload } from '../api'
import { makeToken } from '../utils'

var NotimaticaServiceWorker = {
  _inited: false,

  /**
   * Init SW.
   */
  init: function () {
    if (!NotimaticaServiceWorker._inited) {
      self.addEventListener('push', NotimaticaServiceWorker.onPushReceived)
      self.addEventListener('notificationclick', NotimaticaServiceWorker.onNotificationClicked)

      NotimaticaServiceWorker._inited = true
    }

    console.log('Notimatica ServiceWorker inited')

    return NotimaticaServiceWorker
  },

  /**
   * Push received event.
   *
   * @param  {Object} event The push event
   * @return {Object}
   */
  onPushReceived: function (event) {
    console.log('Push message received', event)

    return event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          if (!subscription) return

          console.log(subscription)

          const token = makeToken(subscription.endpoint)

          return getPayload(token)
            .then((res) => {
              console.log(res)
              return self.registration.showNotification(res.payload.title, {
                body: res.payload.body,
                icon: res.payload.icon,
                tag: res.payload.tag,
                data: {
                  url: res.payload.url
                }
              })
            })
            .catch((err) => console.log(err))
        })
    )
  },

  /**
   * Notification clicked event.
   *
   * @param  {Object} event The event.
   * @return {Object}
   */
  onNotificationClicked: function (event) {
    console.log('Notification click: tag ', event.notification.tag)

    const url = event.notification.data.url

    event.notification.close()

    if (url) {
      return event.waitUntil(
        clients.matchAll({ type: 'window' })
          .then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
              let client = windowClients[i]

              if (client.url === url && 'focus' in client) {
                return client.focus()
              }
            }

            if (clients.openWindow) return clients.openWindow(url)
          })
      )
    }
  }
}

module.exports = NotimaticaServiceWorker.init()
