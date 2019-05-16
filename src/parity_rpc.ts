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
  static getParityApiHelper (url: string | object = 'http://0.0.0.0:8545', type = 1): any {
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
      return new EtherscanApi(`mainnet`)
    }
  }
}

class EtherscanApi {

  _client: EtherscanApiHelper
  eth: Eth

  constructor (network: string) {
    this._client = new EtherscanApiHelper(network)
    this.eth = new Eth(this._client)
  }



}

class Eth {

  _client: EtherscanApiHelper

  constructor (client) {
    this._client = client
  }

  async getTransactionCount (address: string): Promise<any> {
    return await this._client.getTransactionCount(address)
  }

  async getTokenBalance (contractAddress: string, address: string): Promise<string> {
    return await this._client.getTokenBalance(contractAddress, address)
  }

  /**
   * 获取eth余额
   * @param address
   * @returns {Promise<string>} wei
   */
  async getBalance (address: string): Promise<string> {
    return await this._client.getBalance(address)
  }

  async getTransactionByHash (hash: string): Promise<any> {
    return await this._client.getTransactionByHash(hash)
  }

  async sendRawTransaction (hex: string): Promise<void> {
    return await this._client.sendRawTransaction(hex)
  }
}
