import AbstractProvider from './abstract'
import { PROVIDER_UNKNOWN } from '../../defaults'

const provider = class Unknown extends AbstractProvider {
  /**
   * Provider name.
   *
   * @return {String}
   */
  get name () {
    return PROVIDER_UNKNOWN
  }
}

module.exports = provider
