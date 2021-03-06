let unknown = false

// screen
let screenSize = ''
if (window.screen.width) {
  const width = (window.screen.width) ? window.screen.width : ''
  const height = (window.screen.height) ? window.screen.height : ''
  screenSize += '' + width + 'x' + height
}

// browser
let nVer = navigator.appVersion
let nAgt = navigator.userAgent
let browser = navigator.appName
let version = '' + parseFloat(navigator.appVersion)
let majorVersion = parseInt(navigator.appVersion, 10)
let nameOffset, verOffset, ix

// Opera
if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
  browser = 'opera'
  version = nAgt.substring(verOffset + 6)
  if ((verOffset = nAgt.indexOf('Version')) !== -1) {
    version = nAgt.substring(verOffset + 8)
  }
}
// Opera Next
if ((verOffset = nAgt.indexOf('OPR')) !== -1) {
  // MSIE
  browser = 'opera'
  version = nAgt.substring(verOffset + 4)
} else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
  browser = 'ie'
  version = nAgt.substring(verOffset + 5)
} else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
  // Chrome
  browser = 'chrome'
  version = nAgt.substring(verOffset + 7)
} else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
  // Safari
  browser = 'safari'
  version = nAgt.substring(verOffset + 7)
  if ((verOffset = nAgt.indexOf('Version')) !== -1) {
    version = nAgt.substring(verOffset + 8)
  }
} else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
  // Firefox
  browser = 'firefox'
  version = nAgt.substring(verOffset + 8)
} else if (nAgt.indexOf('Trident/') !== -1) {
  // MSIE 11+
  browser = 'ie'
  version = nAgt.substring(nAgt.indexOf('rv:') + 3)
} else if ((verOffset = nAgt.indexOf('Edge/')) !== -1) {
  // MS Edge
  browser = 'edge'
  version = nAgt.substring(verOffset + 4)
} else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
  // Other browsers
  browser = nAgt.substring(nameOffset, verOffset)
  version = nAgt.substring(verOffset + 1)
  if (browser.toLowerCase() === browser.toUpperCase()) {
    browser = navigator.appName
  }
}

// trim the version string
if ((ix = version.indexOf(';')) !== -1) version = version.substring(0, ix)
if ((ix = version.indexOf(' ')) !== -1) version = version.substring(0, ix)
if ((ix = version.indexOf(')')) !== -1) version = version.substring(0, ix)

majorVersion = parseInt('' + version, 10)
if (isNaN(majorVersion)) {
  version = '' + parseFloat(navigator.appVersion)
  majorVersion = parseInt(navigator.appVersion, 10)
}

// mobile version
let mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer)

// cookie
let cookieEnabled = navigator.cookieEnabled

if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
  document.cookie = 'testcookie'
  cookieEnabled = document.cookie.indexOf('testcookie') !== -1
}

// system
let os = unknown
let clientStrings = [
  {s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/},
  {s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/},
  {s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/},
  {s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/},
  {s: 'Windows Vista', r: /Windows NT 6.0/},
  {s: 'Windows Server 2003', r: /Windows NT 5.2/},
  {s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/},
  {s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/},
  {s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/},
  {s: 'Windows 98', r: /(Windows 98|Win98)/},
  {s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/},
  {s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
  {s: 'Windows CE', r: /Windows CE/},
  {s: 'Windows 3.11', r: /Win16/},
  {s: 'android', r: /Android/},
  {s: 'openbsd', r: /OpenBSD/},
  {s: 'sun', r: /SunOS/},
  {s: 'linux', r: /(Linux|X11)/},
  {s: 'ios', r: /(iPhone|iPad|iPod)/},
  {s: 'mac', r: /Mac OS X/},
  {s: 'mac', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
  {s: 'qnx', r: /QNX/},
  {s: 'unix', r: /UNIX/},
  {s: 'beos', r: /BeOS/},
  {s: 'os2', r: /OS\/2/},
  {s: 'search_bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
]

for (let id in clientStrings) {
  let cs = clientStrings[id]
  if (cs.r.test(nAgt)) {
    os = cs.s
    break
  }
}

let osVersion = unknown

if (/Windows/.test(os)) {
  osVersion = /Windows (.*)/.exec(os)[1]
  os = 'windows'
}

switch (os) {
  case 'mac':
    osVersion = /Mac OS X (10[\._\d]+)/.exec(nAgt)[1].replace(/_/g, '.')
    break

  case 'android':
    osVersion = /Android ([\._\d]+)/.exec(nAgt)[1]
    break

  case 'ios':
    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer)
    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0)
    break
}

// flash (you'll need to include swfobject)
/* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
let flashVersion = unknown
if (typeof window.swfobject !== 'undefined') {
  let fv = window.swfobject.getFlashPlayerVersion()
  if (fv.major > 0) {
    flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release
  }
}

let localStorage = unknown
if (typeof window.Storage !== 'undefined') {
  localStorage = true
}

let indexedDB = unknown
if (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB) {
  indexedDB = true
}

let language = unknown
language = navigator.language
  ? (navigator.language.length > 3
    ? navigator.language.substring(0, 2)
    : navigator.language)
    : 'en'

let timezone = new Date().getTimezoneOffset() * -60

export default {
  env: 'browser',
  screen: screenSize,
  browser: browser,
  browserVersion: version,
  browserMajorVersion: majorVersion,
  mobile: mobile,
  os: os,
  osVersion: osVersion,
  cookies: cookieEnabled,
  flashVersion: flashVersion,
  localStorage: localStorage,
  indexedDB: indexedDB,
  language: language,
  timezone: timezone
}
