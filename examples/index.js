var Notimatica = Notimatica || []

Notimatica.push(['on', 'ready', function () {
  if (Notimatica.isUnsubscribed()) {
    $('.subscribe_link').removeClass('hidden')
  } else {
    $('.unsubscribe_link').removeClass('hidden')
  }
}])

Notimatica.push(['on', 'subscribe:success', function (token) {
  $('.subscribe_link').addClass('hidden')
  $('.unsubscribe_link').removeClass('hidden')
}])

Notimatica.push(['on', 'unsubscribe:success', function () {
  $('.subscribe_link').removeClass('hidden')
  $('.unsubscribe_link').addClass('hidden')
}])

Notimatica.push(['init', {
  project: '08823593-135f-5576-9a91-f3a0675aa1d2',
  debug: true
}])
