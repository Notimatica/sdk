import Storage from '../storage'
import { getPayload, httpCall } from '../api'
import { VERSION } from '../defaults'
import { makeToken, strAfter } from '../utils'

var NSW = {
  _inited: false,
  visitor: null,
  debug: typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV !== 'production',

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
          if (debug !== null) NSW.debug = debug
        })

      NSW._inited = true
    }

    NSW.log('Notimatica: ServiceWorker inited')

    return NSW
  },

  /**
   * Push received event.
   *
   * @param  {Object} event The push event
   * @return {Object}
   */
  onPushReceived (event) {
    NSW.log('Notimatica: message received', event)

    return event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then((subscription) => {
          if (!subscription) return

          const token = makeToken(subscription.endpoint)

          return getPayload(token)
            .then((payload) => {
              NSW.log('Notimatica: payload received', payload)

              NSW.storage.get('notifications', payload.id)
                .then((value) => {
                  if (value) throw new Error('Already seen')

                  NSW.showNotification(payload)
                    .then(() => Promise.all([
                      NSW.storage.set('notifications', payload),
                      NSW.storage.set('key_value', {
                        key: 'fallback_notification',
                        value: payload
                      })
                    ]))
                    .then(() => NSW.processWebHook('notification:show', payload))
                })
            })
            .catch((err) => {
              NSW.log('Notimatica: payload error:', err)

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
      data: {
        url: payload.url
      }
    }

    return self.registration.showNotification(payload.title, notification)
  },

  /**
   * Show fallback notification if something was wrong with the current notification.
   *
   * @return {Promise}
   */
  showFallbackNotification () {
    this.storage.get('key_value', 'fallback_notification')
      .then((notification) => {
        if (!notification) throw new Error('No fallback notification')

        NSW.log('Notimatica: display fallback notification')

        NSW.showNotification(notification.value)
      })
      .catch(() => {
        NSW.log('Notimatica: display backup notification')

        return Promise.all([
          this.storage.get('key_value', 'page_title'),
          this.storage.get('key_value', 'base_url'),
          this.storage.get('key_value', 'project')
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
    NSW.log('Notimatica: click ', event.notification.data.url)

    const url = event.notification.data.url

    let urlOrigin = null
    try {
      urlOrigin = new URL(url).origin
    } catch (e) {}

    event.notification.close()

    if (url) {
      return event.waitUntil(
        Promise.all([
          clients.matchAll({ type: 'window', includeUncontrolled: true }),
          this.storage.get('key_value', 'match_exact_url')
        ])
          .then(([windowClients, matchExactUrl]) => {
            matchExactUrl = matchExactUrl !== undefined
              ? matchExactUrl.value
              : true

            for (let client of windowClients) {
              if ('focus' in client) {
                let clientUrl = (client.frameType && client.frameType === 'nested')
                  ? decodeURIComponent(strAfter(client.url, '?to='))
                  : client.url

                let clientOrigin = new URL(clientUrl).origin

                if (matchExactUrl) {
                  if (clientUrl === url) return client.focus()
                } else {
                  if (clientOrigin === urlOrigin) return client.focus()
                }

                return client.focus()
              }
            }

            if (clients.openWindow) return clients.openWindow(url)
          })
      )
    }
  },

  onNotificationClosed (event) {
    NSW.log('Notimatica: close ', event.notification.data)

    return event.waitUntil(
      NSW.processWebHook('notification:closed', event.notification.data)
    )
  },

  /**
   * Process webhook
   *
   * @param  {String} webhook      The webhook id
   * @param  {Object} notification The notification
   * @return {Promise}
   */
  processWebHook (webhook, notification) {
    return Promise.all([
      NSW.storage.get('key_value', 'webhook:' + webhook),
      NSW.storage.get('key_value', 'cors'),
      NSW.storage.get('key_value', 'subscriber')
    ])
      .then(([webhook, cors, subscriber]) => {
        if (webhook) {
          return httpCall('post', webhook.url, {
            title: notification.title,
            body: notification.body,
            tag: notification.tag,
            subsciber: subscriber
          }, { 'X-Notimatica-SDK': VERSION }, cors)
        }
      })
  },

  /**
   * Log message.
   */
  log () {
    if (NSW.debug) {
      console.log.apply(console, arguments)
    }
  }
}

module.exports = NSW.init()
