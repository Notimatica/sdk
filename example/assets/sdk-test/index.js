var Notimatica = Notimatica || []

function init () {
  Notimatica.push(['on', 'ready', function () {
    $('.provider').text(Notimatica._driver.provider.name)
    $('.options').text(JSON.stringify(Notimatica.options, null, 2))

    if (Notimatica.isUnsubscribed()) {
      $('.subscribe-link').removeClass('hidden')
    } else {
      $('.unsubscribe-link').removeClass('hidden')
    }
  }])

  Notimatica.push(['on', 'subscribe:success', function (token) {
    $('.subscribe-link').addClass('hidden')
    $('.unsubscribe-link').removeClass('hidden')
  }])

  Notimatica.push(['on', 'unsubscribe:success', function () {
    $('.subscribe-link').removeClass('hidden')
    $('.unsubscribe-link').addClass('hidden')
  }])

  var options = {
    project: '08823593-135f-5576-9a91-f3a0675aa1d2',
    debug: true,
    autoSubscribe: true,
    subdomain: 'subscribe',
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
    },
    webhooksCors: true
  }

  if (window.location.host === 'localhost:8081') {
    options.sdkPath = ''
  }

  Notimatica.push(['init', options])
}

init()

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
