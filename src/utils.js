export var array = []

export var ExtendedObject = function () {
  var obj = function (option) {
    var options = option || {}
    this.extend(options)
  }

  obj.prototype.extend = extend
  obj.prototype.getProperty = getProperty

  return obj
}

export var extend = function (object) {
  object = object || {}

  for (var i in object) {
    if (object.hasOwnProperty(i)) {
      this[i] = object[i]
    }
  }
}

export var merge = function (target, object) {
  object = object || {}

  for (var i in object) {
    if (object.hasOwnProperty(i)) {
      target[i] = object[i]
    }
  }
}

export function getProperty (propertyName, object) {
  if (propertyName === undefined) {
    return object
  }

  var parts = propertyName.split('.')
  var length = parts.length
  var property = object || this

  for (var i = 0; i < length; i++) {
    if (property[parts[i]] === undefined) {
      throw new Error(propertyName + ' is undefined')
    }
    property = property[parts[i]]
  }

  return property
}
