export const VERSION = '0.0.1'

export const DEBUG = process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== 'production'

export const ENV_SDK = 'sdk'
export const ENV_SW = 'sw'

export const PROVIDER_CHROME = 'chrome'
export const PROVIDER_FIREFOX = 'firefox'
export const PROVIDER_SAFARI = 'safari'

export const PROVIDERS_ENDPOINTS = {
  [PROVIDER_CHROME]: 'https://android.googleapis.com/gcm/send/',
  [PROVIDER_FIREFOX]: 'https://updates.push.services.mozilla.com/push/v1/'
}

export const API_URL = 'https://api.notimatica.io'
export const POSTMAN_URL = 'https://postman.notimatica.io'
export const SDK_PATH = '/notimatica-sdk'
export const AUTOSUBSCRIBE = true
