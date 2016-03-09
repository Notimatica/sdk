/*eslint no-unused-vars: 0*/

if (typeof Notimatica !== 'undefined') {
  const registeredActions = Notimatica
}

require('expose?Notimatica!./sdk.js')

if (typeof registeredActions !== 'undefined') {
  Notimatica._processRegisteredActions(registeredActions)
}
