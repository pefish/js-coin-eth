/** @module */
import Api from '@parity/api'
import EtherscanApiHelper from './etherscan_api'

/**
 * parity rpc调用工具
 */
export default class ParityRpc {
  /**
   * 获取parity api调用器
   * @param url
   * @param type {number} 1 节点提供的rpc  2 etherscan提供的api接口
   */
  static getParityApiHelper (url = 'http://0.0.0.0:8545', type = 1) {
    let apiKey
    if (typeof url !== 'string') {
      apiKey = url['apiKey']
      if (url['url']) {
        url = url['url']
      } else {
        url = `${url['protocol']}://${url['host']}${url['port'] ? `:${url['port']}` : ''}${url['path'] || ''}`
      }
    }
    if (type === 1) {
      let provider = new Api.Provider.Http(url)
      return new Api(provider)
    } else if (type === 2) {
      return new EtherscanApi(url, apiKey)
    }
  }
}

class EtherscanApi {
  constructor (url, apikey) {
    this._client = new EtherscanApiHelper(url, apikey)
    this.eth = new Eth(this._client)
  }



}

class Eth {
  constructor (client) {
    this._client = client
  }

  async getTransactionCount (address) {
    return this._client.getTransactionCount(address)
  }

  async getTokenBalance (contractAddress, address) {
    return this._client.getTokenBalance(contractAddress, address)
  }

  async getBalance (address) {
    return this._client.getBalance(address)
  }

  async getTransactionByHash (hash) {
    return this._client.getTransactionByHash(hash)
  }

  async sendRawTransaction (hex) {
    return this._client.sendRawTransaction(hex)
  }
}
