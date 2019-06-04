import ErrorHelper from '@pefish/js-error'
import Web3 from 'web3'
import BaseEtherLike from "./base/base_ether_like";

export class Browser extends BaseEtherLike {

  contracts: object
  eth: any

  public constructor(web3) {
    super()
    this.contracts = {}
    this.eth = web3.eth
  }

  setContract(name, abi, address) {
    this.contracts[name] = new this.eth.Contract(abi, address)
  }

  async callContract(contractName, methedName, params = []) {
    return this.contracts[contractName].methods[methedName](...params).call()
  }

  async getBalance(address) {
    return this.eth.getBalance(address)
  }

  listenAllEvent(contractName, opts, cb) {
    this.contracts[contractName].events.allEvents(opts, cb)
  }

  async getPastEvents(contractName, opts, eventName = 'allEvents') {
    return await this.contracts[contractName].getPastEvents(eventName, opts)
  }

  async getLatestBlockNumber() {
    return (await this.eth.getBlockNumber()).toString(10)
  }

  async getTransactionCount(address) {
    return this.eth.getTransactionCount(address)
  }

  async sendRawTransaction(hex) {
    return this.eth.sendSignedTransaction(hex)
  }

  async getConfirmations(txId) {
    const result = await this.eth.getTransaction(txId)
    if (!result || !result['blockNumber']) {
      return '0'
    }
    const latestNumber = await this.getLatestBlockNumber()
    return latestNumber.sub(result['blockNumber']).add(1)
  }
}

export default class Web3Helper extends Browser {

  browsers: object

  constructor(providers = {}) {
    if (!providers['default']) {
      super(new Web3(providers[Object.keys(providers)[0]]))
    } else {
      super(new Web3(providers['default']))
    }
    this.browsers = {}
    for (let [name, value] of Object.entries(providers)) {
      if (typeof value === 'string') {
        this.browsers[name] = new Browser(new Web3(value))
      } else {
        if (value['type'] === 'ws') {
          this.browsers[name] = new Browser(new Web3(new Web3.providers.WebsocketProvider(value['url'])))
        } else if (value['type'] === 'http') {
          this.browsers[name] = new Browser(new Web3(new Web3.providers.HttpProvider(value['url'])))
        } else {
          throw new ErrorHelper(`type 有误`)
        }
      }
    }
  }

  setBrowser(name, provider) {
    this.browsers[name] = new Browser(new Web3(provider))
  }

  static parseStructResult(result) {
    const result1 = {}
    for (let key in result) {
      if (isNaN(Number(key))) {
        result1[key] = result[key]
      }
    }
    return result1
  }

  static getMethodId(methodName, methodParamTypes) {
    const abiUtil = require('./abi')
    return '0x' + abiUtil.methodID(methodName, methodParamTypes).toString(`hex`)
  }

  static encodePayload(methodName, methodParamTypes, params) {
    const abiUtil = require('./abi')
    const paramsHex = abiUtil.rawEncode(methodParamTypes, params).toHexString_(false)
    return Web3Helper.getMethodId(methodName, methodParamTypes) + paramsHex
  }
}

