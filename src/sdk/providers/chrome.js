import Gcm from './gcm'
import { PROVIDER_CHROME } from '../../defaults'

const provider = class Chrome extends Gcm {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return PROVIDER_CHROME
  }
}

module.exports = provider
