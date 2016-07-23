var Notimatica = Notimatica || []

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
  safariWebId: 'web.io.notimatica',
  debug: true,
  autoSubscribe: false,
  tags: [
    123456789,
    'foo',
    'bar'
  ],
  plugins: {
    button: {
      enable: true,
      css: '/notimatica-button.css'
    }
  }
}

if (window.location.host === 'localhost:8081') {
  options.sdkPath = ''
}

Notimatica.push(['init', options])

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
    Notimatica.push(['emit', 'popover:show', 'You have a message!', 'Something in our SDK sent you a message'])
  })

  $('.send-notification').on('click', function () {
    Notimatica.push(['emit', 'self-notification', {
      title: $('#title').val(),
      body: $('#body').val()
    }])
  })
})
