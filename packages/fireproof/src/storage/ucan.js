import fetch from 'cross-fetch'
import { Base } from './base.js'

const defaultConfig = {
  upload: () => {},
  url: (cid) => `https://${cid}.ipfs.w3s.link/`
}

export class UCAN extends Base {
  constructor (name, config = {}) {
    super(name, Object.assign({}, defaultConfig, config))
  }

  async writeCars (cars) {
    if (this.config.readonly) return
    for (const { cid, bytes } of cars) {
      console.log(`write UCAN ${cid}, ${bytes.length} bytes`)
      const upCid = await this.config.upload(bytes)
      console.log(`wrote UCAN ${cid}, ${upCid}`)
      // if (!response.ok) throw new Error(`An error occurred: ${response.statusText}`)
    }
  }

  async readCar (carCid) {
    const carURL = this.config.url(carCid)
    const response = await fetch(carURL)
    if (!response.ok) throw new Error(`An error occurred: ${response.statusText}`)
    const got = await response.arrayBuffer()
    return new Uint8Array(got)
  }

  async loadHeader (branch = 'main') {
    return headerMock.get(branch)
  }

  async writeHeader (branch, header) {
    if (this.config.readonly) return
    const pHeader = this.prepareHeader(header)
    // console.log('writeHeader rt', branch, pHeader)

    headerMock.set(branch, pHeader)
  }
}

const headerMock = new Map()
