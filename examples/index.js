var Notimatica = Notimatica || []

Notimatica.push(['on', 'ready', function () {
  console.log('event: inited', Notimatica)
  if (Notimatica.isUnsubscribed()) {
    $('.subscribe_link').removeClass('hidden')
  } else {
    $('.unsubscribe_link').removeClass('hidden')
  }
}])

Notimatica.push(['on', 'subscribe:success', function (token) {
  console.log('event: subscribed', token)
  $('.subscribe_link').addClass('hidden')
  $('.unsubscribe_link').removeClass('hidden')
}])

Notimatica.push(['on', 'subscribe:fail', function (err) {
  console.log('event: subscribe failed', err)
}])

Notimatica.push(['on', 'unsubscribe:success', function () {
  $('.subscribe_link').removeClass('hidden')
  $('.unsubscribe_link').addClass('hidden')
}])

Notimatica.push(['on', 'unsubscribe:fail', function (err) {
  console.log('event: subscribe failed', err)
}])

Notimatica.push(['init', {
  project: '08823593-135f-5576-9a91-f3a0675aa1d2',
  debug: true,
  usePopup: true
}])
