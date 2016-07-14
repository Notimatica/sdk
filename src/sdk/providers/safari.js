import AbstractProvider from './abstract'
import { PROVIDER_SAFARI } from '../../defaults'

const provider = class Safari extends AbstractProvider {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return PROVIDER_SAFARI
  }
}

module.exports = provider
