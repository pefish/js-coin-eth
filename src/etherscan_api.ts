import HttpRequestUtil from 'js-httprequest'
import ErrorHelper from 'p-js-error'

export default class EtherscanApiHelper {

    _invalid: boolean
    _baseUrl: string
    _apiKey: string

  constructor (network: string = `testnet`) {
    if (network !== `testnet` && network !== `mainnet`) {
      this._invalid = true
    }
    if (network === `testnet`) {
      this._baseUrl = `https://api-kovan.etherscan.io/api`
    } else {
      this._baseUrl = `https://api.etherscan.io/api`
    }

    this._apiKey = `WDF9SBXFCPJKSBD9QEA59B2FDJIFMYTDGJ`
  }

  async getTokenBalance(contractAddress: string, address: string): Promise<string> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'account',
      action: 'tokenbalance',
      contractaddress: contractAddress,
      address,
      tag: 'latest',
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error']['message'])
    }
    return result['result']
  }

  async getTransactionCount(address: string): Promise<string> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_getTransactionCount',
      address,
      tag: 'latest',
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result'].hexToDecimalString_()
  }

  async sendRawTransaction(txHex: string): Promise<any> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_sendRawTransaction',
      hex: txHex,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return true
  }

  async blockNumber(): Promise<string> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_blockNumber',
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result'].hexToDecimalString_()
  }

  /**
   * 根据高度获取块数据
   * @param height {number | string} 十进制
   * @param boolean {boolean} 是否显示txs
   * @returns {Promise<number|*|*>}
   */
  async getBlockByNumber(height: number | string, boolean = true): Promise<any> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_getBlockByNumber',
      tag: height.toString().decimalToHexString_(),
      boolean,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }

  async getTransactionByHash(txHash: string): Promise<any> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash: txHash,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_getTransactionReceipt',
      txhash: txHash,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }

  async getTransactionByAddress(address: string, page: number, offset: number): Promise<any> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'account',
      action: 'txlist',
      address: address,
      page: page,
      offset: offset,
      sort: 'asc'
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }

  async gasPrice(): Promise<string> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_gasPrice',
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result'].hexToDecimalString_()
  }

  /**
   * 取余额，单位wei, 十进制
   * @param address
   * @returns {Promise<string>}
   */
  async getBalance (address: string): Promise<string> {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'account',
      action: 'balance',
      tag: 'latest',
      address,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }
}
