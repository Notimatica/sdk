/*global init */

var options = {
  emulate: true,
  debug: true,
  autoSubscribe: true,
  safariWebId: 'web.io.notimatica',
  tags: [
    123456789,
    'foo',
    'bar'
  ],
  plugins: {
    prompt: {
      enable: true
    }
  },
  strings: {
    en: {
      'popup.welcome': 'Subscribing to {project}'
    }
  },
  webhooks: {
    'notification:show': 'http://localhost:8081/webhook/show',
    'notification:click': 'http://localhost:8081/webhook/click',
    'notification:close': 'http://localhost:8081/webhook/close'
  }
}

init(options)

$(function () {
  $('.subscribe-link').on('click', function (e) {
    Notimatica.push(['subscribe'])
  })
  $('.unsubscribe-link').on('click', function (e) {
    Notimatica.push(['unsubscribe'])
  })

  $('.show-message').on('click', function (e) {
    Notimatica.push(['emit', 'user:interact', 'You have a message!', 'Something on our site needs you attention.'])
  })
  $('.show-prompt').on('click', function (e) {
    Notimatica.push(['emit', 'user:interact'])
  })

  $('.reset-sdk').on('click', function (e) {
    Notimatica.push(['resetSDK'])
  })
  $('.reset-state').on('click', function (e) {
    Notimatica.push(['resetState'])
  })
  $('.rebuild-sdk').on('click', function (e) {
    Notimatica.push(['resetSDK'])
    init(options)
  })

  $('.enable-button').on('click', function (e) {
    Notimatica.push(['resetSDK'])
    options.plugins = {
      button: {
        enable: true
      }
    }
    init(options)
  })
  $('.enable-prompt').on('click', function (e) {
    Notimatica.push(['resetSDK'])
    options.plugins = {
      prompt: {
        enable: true
      }
    }
    init(options)
  })
})
