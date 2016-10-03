import Storage from '../storage'
import logs from '../mixins/logs'
import { getPayload, getRedirect, httpCall } from '../api'
import { VERSION } from '../defaults'
import { getQueryParameter } from '../utils'

var NSW = {
  _inited: false,
  _debug: typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV !== 'production',
  visitor: null,

  /**
   * Init SW.
   */
  init () {
    if (!NSW._inited) {
      self.addEventListener('push', NSW.onPushReceived)
      self.addEventListener('notificationclick', NSW.onNotificationClicked)
      self.addEventListener('notificationclosed', NSW.onNotificationClosed)

      NSW.storage = Storage
      NSW.storage.get('key_value', 'debug')
        .then((debug) => {
          if (debug !== null) NSW._debug = debug
        })

      NSW._inited = true
    }

    NSW.debug('ServiceWorker inited')

    return NSW
  },

  /**
   * Push received event.
   *
   * @param  {Object} event The push event
   * @return {Object}
   */
  onPushReceived (event) {
    NSW.debug('Message received', event)

    return event.waitUntil(
      NSW.storage.get('key_value', 'subscriber')
        .then((uuid) => {
          if (!uuid) throw new Error('UUID not found')

          const rand = Math.round(Math.random() * 3000)

          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(getPayload(uuid.value))
            }, rand)
          })
        })
        .then((payload) => {
          NSW.debug('Payload received', payload)

          return NSW.showNotification(payload)
            .then(() => Promise.all([
              NSW.storage.set('notifications', payload),
              NSW.storage.set('key_value', {
                key: 'fallbackNotification',
                value: payload
              })
            ]))
            .then(() => NSW.callWebhook('notification:show', payload))
        })
        .catch((err) => {
          NSW.debug('Payload error', err)

          if (!self.UNSUBSCRIBED_FROM_NOTIFICATIONS) {
            return NSW.showFallbackNotification()
          }
        })
      )
  },

  /**
   * Show notification.
   *
   * @param  {Object} payload The payload
   * @return {Promise}
   */
  showNotification (payload) {
    const notification = {
      body: payload.body,
      icon: payload.icon,
      tag: payload.tag,
      data: payload
    }

    return self.registration.showNotification(payload.title, notification)
  },

  /**
   * Show fallback notification if something was wrong with the current notification.
   *
   * @return {Promise}
   */
  showFallbackNotification () {
    NSW.storage.get('key_value', 'fallbackNotification')
      .then((notification) => {
        if (!notification) throw new Error('No fallback notification')

        NSW.debug('Display fallback notification')

        NSW.showNotification(notification.value)
      })
      .catch(() => {
        NSW.debug('Display backup notification')

        return Promise.all([
          NSW.storage.get('key_value', 'pageTitle'),
          NSW.storage.get('key_value', 'baseUrl'),
          NSW.storage.get('key_value', 'project')
        ]).then(([title, url, project]) => {
          return NSW.showNotification({
            body: 'You have an update.',
            title: title.value || null,
            tag: project || null,
            url: url.value || null
          })
        })
      })
  },

  /**
   * Notification clicked event.
   *
   * @param  {Object} event The event.
   * @return {Object}
   */
  onNotificationClicked (event) {
    NSW.debug('Click', event.notification.data)

    const notification = event.notification.data
    notification.action = event.action

    event.notification.close()

    if (!notification.url) return

    return event.waitUntil(
      Promise.all([
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }), // Retrieve all subscribed tabs including iframes
        NSW.storage.get('key_value', 'matchExactUrl'), // Retrieve url match rule
        getRedirect(notification.id) // Retrieve url to open on click
      ])
        .then(([ windowClients, matchExactUrl, url ]) => {
          matchExactUrl = matchExactUrl !== undefined
            ? matchExactUrl.value
            : true

          let urlOrigin = null
          try {
            urlOrigin = new URL(url).origin
          } catch (e) {}

          for (let client of windowClients) {
            if ('focus' in client) {
              // If client is iframe, search for parent url in GET param 'parent'
              // Or return client's url itself
              let clientUrl = (client.frameType && client.frameType === 'nested')
                ? getQueryParameter('parent', client.url)
                : client.url

              let clientOrigin = new URL(clientUrl).origin

              // If matchExactUrl=true, match full client url with full click url,
              // or match their origins
              if (matchExactUrl) {
                if (clientUrl === url) return client.focus()
              } else {
                if (clientOrigin === urlOrigin) return client.focus()
              }
            }
          }

          // If no client found, open new url
          if (clients.openWindow) return clients.openWindow(url)
        })
        .then(() => NSW.callWebhook('notification:click', notification))
      )
  },

  /**
   * On close event.
   *
   * @param  {Object} event The event
   * @return {Promise}
   */
  onNotificationClosed (event) {
    NSW.debug('Close', event.notification.data)

    let notification = event.notification.data
    notification.action = '_close'

    return event.waitUntil(
      NSW.callWebhook('notification:close', notification)
    )
  },

  /**
   * Call webhook.
   *
   * @param  {String} webhook      The webhook id
   * @param  {Object} notification The notification
   * @return {Promise}
   */
  callWebhook (webhook, notification) {
    return Promise.all([
      NSW.storage.get('key_value', 'webhooks'),
      NSW.storage.get('key_value', 'webhooksCors'),
      NSW.storage.get('key_value', 'subscriber'),
      NSW.storage.get('key_value', 'extra')
    ])
      .then(([ webhooks, webhooksCors, subscriber, extra ]) => {
        if (webhooks && webhooks.value[webhook]) {
          const hook = webhooks.value[webhook]
          const data = {
            event: webhook,
            notification: notification.id,
            title: notification.title,
            body: notification.body,
            project: notification.tag,
            subscriber: {
              uuid: subscriber.value ? subscriber.value : null,
              extra: extra.value ? extra.value : {}
            },
            action: notification.action || '_click'
          }

          NSW.debug('Calling webhook', webhook, hook, data)

          return httpCall('post', hook, data, {
            'X-Notimatica-SDK': VERSION,
            'X-Notimatica-SDK-Event': webhook
          }, webhooksCors ? webhooksCors.value : false)
        }
      })
  }
}

logs(NSW, 'Notimatica SW: ')

module.exports = NSW.init()
