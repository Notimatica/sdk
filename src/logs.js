import { isString } from './utils'

export default function Logs (target, prefix, style) {
  target = target || this

  target.log = function (type, args) {
    if (!target._debug) return

    args = Array.prototype.slice.call(args)
    if (isString(args[0]) && prefix) {
      let message = args.shift()
      message = [
        `%c${prefix}%c` + message,
        'color:#fdbd2c;font-weight:bold;',
        'color:black;font-weight:normal;'
      ]
      args = message.concat(args)
    }

    console[type].apply(console, args)
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
