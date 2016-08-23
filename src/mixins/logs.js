export default function Logs (target, prefix, style) {
  const css = {
    normal: 'color:black;font-weight:normal;',
    prefix: style || 'color:#fdbd2c;font-weight:bold;'
  }

  target = target || this

  target.log = function (type, args) {
    if (!target._debug) return

    args = Array.prototype.slice.call(args)
    if (typeof args[0] === 'string' && prefix) {
      let message = args.shift()
      message = [
        `%c${prefix}%c` + message,
        css.prefix,
        css.normal
      ]
      args = message.concat(args)
    }

    console[type].apply(console, args)
  }

  target.debug = function () {
    target.log('log', arguments)
  }

  target.warn = function () {
    target.log('warn', arguments)
  }

  target.error = function () {
    target.log('error', arguments)
  }
}
