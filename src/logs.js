import { isString } from './utils'

export default function Logs (target, prefix, style) {
  target = target || this

  target.log = function (type, context) {
    if (!target._debug) return

    if (isString(context[0])) context[0] = prefix + context[0]
    console[type].apply(console, context)
  }

  target.debug = function () {
    target.log('log', arguments)
  }

  target.warning = function () {
    target.log('warn', arguments)
  }

  target.error = function () {
    target.log('error', arguments)
  }
}
