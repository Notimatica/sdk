import Gcm from './gcm'
import { PROVIDER_FIREFOX } from '../../defaults'

const provider = class Firefox extends Gcm {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return PROVIDER_FIREFOX
  }
}

module.exports = provider
