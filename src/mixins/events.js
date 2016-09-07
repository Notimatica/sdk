/*eslint one-var: 0*/
/*eslint no-cond-assign: 0*/

/**
 * Events mixin.
 * Thanks to https://github.com/allouis/minivents
 *
 * @param {Object} target The mixin target
 */
export default function Events (target) {
  var events = {}, empty = []
  target = target || this

  /**
   * Listen to events.
   *
   * @param {String} name The event name
   * @param {Function} func The event callbacks
   * @param {Object} ctx  The event context
   */
  target.on = function (name, func, ctx) {
    (events[name] = events[name] || []).push([func, ctx])
  }

  /**
   * Stop listening to event / specific callback.
   *
   * @param {String} name The event name
   * @param {Function} func The event callbacks
   */
  target.off = function (name, func) {
    name || (events = {})
    var list = events[name] || empty, i = list.length = func ? list.length : 0
    while (i--) func === list[i][0] && list.splice(i, 1)
  }

  /**
   * Send event, callbacks will be triggered.
   *
   * @param {String} name The event name
   */
  target.emit = function (name) {
    var e = events[name] || empty, list = e.length > 0 ? e.slice(0, e.length) : e, i = 0, j
    while (j = list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
  }
}
