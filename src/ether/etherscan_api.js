import HttpRequestUtil from 'p-js-utils/lib/http_request'
import ErrorHelper from 'p-js-error'

export default class EtherscanApiHelper {
  constructor (network = `testnet`) {
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

  async getTokenBalance(contractAddress, address) {
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

  async getTransactionCount(address) {
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
    return result['result'].hexToDecimalString()
  }

  async sendRawTransaction(txHex) {
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

  async blockNumber() {
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
    return result['result'].hexToDecimalString()
  }

  /**
   * 根据高度获取块数据
   * @param height {number | string} 十进制
   * @param boolean {boolean} 是否显示txs
   * @returns {Promise<number|*|*>}
   */
  async getBlockByNumber(height, boolean = true) {
    if (this._invalid === true) {
      return null
    }
    const result = await HttpRequestUtil.postFormData(this._baseUrl, null, {
      module: 'proxy',
      action: 'eth_getBlockByNumber',
      tag: height.toString().decimalToHexString(),
      boolean,
      apikey: this._apiKey
    })
    if (!result['result']) {
      throw new ErrorHelper(result['error'] ? result['error']['message'] : 'not found')
    }
    return result['result']
  }

  async getTransactionByHash(txHash) {
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

  async getTransactionReceipt(txHash) {
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

  async getTransactionByAddress(address, page, offset) {
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

  async gasPrice() {
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
    return result['result'].hexToDecimalString()
  }

  /**
   * 取余额，单位wei, 十进制
   * @param address
   * @returns {Promise<string>}
   */
  async getBalance (address) {
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
