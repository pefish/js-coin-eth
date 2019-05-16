import Api from 'p-js-rsk-api'

export default class RskRpc {

  getClient () {
    if (!this._client) {
      let provider = new Api.Provider.Http(this._url)
      this._client = new Api(provider)
    }
    return this._client
  }
}
