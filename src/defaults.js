export const VERSION = '0.0.1'

export const DEBUG = process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== 'production'

export const API_URL = 'https://api.notimatica.io'
export const POSTMAN_URL = 'https://postman.notimatica.io'
export const CDN_URL = 'https://cdn.notimatica.io'

export const SDK_PATH = CDN_URL + '/sdks/latest'

export const ENV_SDK = 'sdk'
export const ENV_SW = 'sw'

export const DRIVER_NATIVE = 'native'
export const DRIVER_POPUP = 'popup'
export const DRIVER_IFRAME = 'iframe'
export const DRIVER_EMULATE = 'emulate'

export const PROVIDER_CHROME = 'chrome'
export const PROVIDER_FIREFOX = 'firefox'
export const PROVIDER_SAFARI = 'safari'
export const PROVIDER_UNKNOWN = 'unknown'

export const PROVIDERS_ENDPOINTS = {
  [PROVIDER_CHROME]: 'https://android.googleapis.com/gcm/send/',
  [PROVIDER_FIREFOX]: 'https://updates.push.services.mozilla.com/wpush/v1/',
  [`${PROVIDER_FIREFOX}_new`]: 'https://updates.push.services.mozilla.com/wpush/v1/',
  [PROVIDER_SAFARI]: `${API_URL}/v1/projects/%/safari`
}

export const POPUP_HEIGHT = 450
export const POPUP_WIGHT = 550

export const EXTRA_MAX_LENGTH = 5
export const AUTOSUBSCRIBE = true
export const LOCALE = 'en'
export const DB_VERSION = 1
export const DB_NAME = 'notimatica'
