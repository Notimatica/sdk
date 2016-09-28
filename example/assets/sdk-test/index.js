/*global init */

var options = {
  emulate: true,
  debug: true,
  autoSubscribe: true,
  extra: {
    source: 'playground'
  },
  plugins: {
    button: {
      enable: true
    }
  },
  strings: {
    en: {
      'popup.welcome': 'Subscribing to {project}'
    }
  },
  webhooks: {
    'notification:show': 'https://dev.notimatica.io/webhook/show',
    'notification:click': 'https://dev.notimatica.io/webhook/click',
    'notification:close': 'https://dev.notimatica.io/webhook/close'
  },
  webhooksCors: false
}

init(options)

$(function () {
  $('.subscribe-link').on('click', function () {
    Notimatica.push(['subscribe'])
  })
  $('.unsubscribe-link').on('click', function () {
    Notimatica.push(['unsubscribe'])
  })

  $('.show-message').on('click', function () {
    Notimatica.push(['emit', 'user:interact', 'You have a message!', 'Something on our site needs you attention.'])
  })
  $('.show-prompt').on('click', function () {
    Notimatica.push(['emit', 'user:interact'])
  })

  $('.reset-sdk').on('click', function () {
    Notimatica.push(['resetSDK'])
  })
  $('.reset-state').on('click', function () {
    Notimatica.push(['resetState'])
  })
  $('.rebuild-sdk').on('click', function () {
    Notimatica.push(['resetSDK'])
    init(options)
  })

  $('.enable-button').on('click', function () {
    Notimatica.push(['resetSDK'])
    options.plugins = {
      button: {
        enable: true
      }
    }
    init(options)
  })
  $('.enable-prompt').on('click', function () {
    Notimatica.push(['resetSDK'])
    options.plugins = {
      prompt: {
        enable: true
      }
    }
    init(options)
  })

  if (options.project && !options.emulate) {
    $('.send-test-message').removeClass('hidden')
  }

  $('button.send-test-message').on('click', function () {
    var data = {
      title: $('#title').val(),
      body: $('#body').val()
    }

    $.ajax({
      type: 'POST',
      url: 'https://api.notimatica.io/v1/projects/' + options.project + '/notifications',
      data: data,
      dataType: 'json',
      headers: {
        'authorization': 'Bearer ' + $('#api-key').val()
      },
      success: function (data) {
        $('.send-test-message-result').text('Message sent')
      },
      error: function (jqXHR, status) {
        var message

        switch (jqXHR.status) {
          case 400:
            message = 'API token was not provided'
            break
          case 401:
            message = 'Wrong API key'
            break
          case 422:
            message = 'Validation error'
            break
          default:
            message = 'Unknown error'
        }

        $('.send-test-message-result').show().addClass('text-danger').text(message)
        setTimeout(function () {
          $('.send-test-message-result').fadeOut(1000, function () {
            $(this).removeClass('text-danger').text('')
          })
        }, 2500)
      }
    })
  })
})
