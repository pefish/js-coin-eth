/** @module */

/**
 * parity rpc调用工具
 */
export default class BaseRpc {

  constructor (url) {
    this._url = url
    this._client = null
  }

  getClient () {
    if (!this._client) {
      const Api = require('@parity/api')
      let provider = new Api.Provider.Http(this._url)
      this._client = new Api(provider)
    }
    return this._client
  }
}
