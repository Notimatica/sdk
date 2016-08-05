var Notimatica = Notimatica || []

function init (options) {
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

  if (window.location.host === 'localhost:8081') {
    options.sdkPath = ''
  }

  Notimatica.push(['init', options])
}
