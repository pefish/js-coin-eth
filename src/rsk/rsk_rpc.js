import Api from 'p-js-rsk-api'
import BaseRpc from '../base/base_rpc'

export default class RskRpc extends BaseRpc {
  constructor (url) {
    super(url)
  }

  getClient () {
    if (!this._client) {
      let provider = new Api.Provider.Http(this._url)
      this._client = new Api(provider)
    }
    return this._client
  }
}
