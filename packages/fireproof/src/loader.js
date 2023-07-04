import { Browser } from './storage/browser.js'
import { Rest } from './storage/rest.js'
import { UCAN } from './storage/ucan.js'

export const Loader = {
  appropriate: (name, config = {}) => {
    if (config.StorageClass) {
      return new config.StorageClass(name, config)
    }

    if (config.type === 'rest') {
      return new Rest(name, config)
    }

    if (config.type === 'ucan') {
      return new UCAN(name, config)
    }

    return new Browser(name, config)
  }
}
