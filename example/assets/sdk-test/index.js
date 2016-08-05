init({
  emulate: true,
  debug: true,
  autoSubscribe: true,
  tags: [
    123456789,
    'foo',
    'bar'
  ],
  plugins: {
    button: {
      enable: true
    }
  },
  strings: {
    en: {
      'popup.welcome': 'Subcribing to {project}'
    }
  },
  webhooks: {
    'notification:show': 'http://localhost:8081/webhook/show',
    'notification:click': 'http://localhost:8081/webhook/click',
    'notification:close': 'http://localhost:8081/webhook/close'
  }
})

$(function () {
  $('.subscribe-link').on('click', function (e) {
    e.preventDefault()
    Notimatica.push(['subscribe'])
  })
  $('.unsubscribe-link').on('click', function (e) {
    e.preventDefault()
    Notimatica.push(['unsubscribe'])
  })
  $('.show-message').on('click', function (e) {
    e.preventDefault()
    Notimatica.push(['emit', 'user:message', 'You have a message!', 'Something on our site needs you attention.'])
  })
  $('.reset-state').on('click', function (e) {
    e.preventDefault()
    Notimatica.push(['resetState'])
  })

  $('.rebuild-sdk').on('click', function (e) {
    e.preventDefault()

    Notimatica.push(['resetSDK'])
    init()
  })
})
