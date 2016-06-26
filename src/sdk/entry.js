/*eslint no-unused-vars: 0*/

/**
 * Let sdk be loaded async via [].push method
 */
let registeredActions = []
if (typeof Notimatica !== 'undefined') {
  registeredActions = Notimatica
}

require('expose?Notimatica!./sdk.js')

Notimatica._processRegisteredActions(registeredActions)
