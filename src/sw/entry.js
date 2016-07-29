import Storage from '../storage'
import logs from '../logs'
import { getPayload, getRedirect, httpCall } from '../api'
import { VERSION } from '../defaults'
import { makeToken, getQueryParameter } from '../utils'

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
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          if (!subscription) return

          const token = makeToken(subscription.endpoint)

          return getPayload(token)
            .then((payload) => {
              NSW.debug('Payload received', payload)

              NSW.showNotification(payload)
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
      icon: NSW.ensureImageResourceHttps(payload.icon),
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
   * TNX OneSignal SDK
   *
   * Given an image URL, returns a proxied HTTPS image using the https://images.weserv.nl service.
   * For a null image, returns null so that no icon is displayed.
   * If the image origin contains localhost, starts with 192.168.*.* or already from weserv.nl,
   * we do not proxy the image.
   *
   * @param  {String} imageUrl An HTTP or HTTPS image URL.
   * @return {String|NULL}
   */
  ensureImageResourceHttps (imageUrl) {
    if (!imageUrl) return null

    try {
      let parsedImageUrl = new URL(imageUrl)
      if (/192\.168|localhost|images\.weserv\.nl/.exec(parsedImageUrl.hostname) !== null) return imageUrl
    } catch (e) { }

    /* HTTPS origin hosts can be used by prefixing the hostname with ssl: */
    let replacedImageUrl = imageUrl.replace(/https:\/\//, 'ssl:')
                                   .replace(/http:\/\//, '')

    return `https://images.weserv.nl/?url=${encodeURIComponent(replacedImageUrl)}`
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

    return event.waitUntil(
      NSW.callWebhook('notification:closed', event.notification.data)
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
      NSW.storage.get('key_value', 'webhooksCors')
    ])
      .then(([ webhooks, webhookCors ]) => {
        if (webhooks.value[webhook]) {
          const hook = webhooks.value[webhook]
          const data = {
            title: notification.title,
            body: notification.body,
            project: notification.tag,
            subsciber: notification.subscriber,
            action: notification.action || 'self'
          }

          NSW.debug('Calling webhook', webhook, hook, data)

          return httpCall('post', hook, data, { 'X-Notimatica-SDK': VERSION }, webhookCors.value)
        }
      })
  }
}

logs(NSW, 'Notimatica SW: ')

module.exports = NSW.init()
