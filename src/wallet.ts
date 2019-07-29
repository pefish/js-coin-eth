/** @module */
import '@pefish/js-node-assist'
import BaseEtherLike from './base/base_ether_like'
import ErrorHelper from '@pefish/js-error'
import abiUtil from './abi'
import solc from 'solc'
import EthCrypto from 'eth-crypto'
import Tx from 'ethereumjs-tx'
import keythereum from 'keythereum'
import Web3 from 'web3'
import * as EtherUtil from 'ethereumjs-util'
import Remote from './remote'

/**
 * 以太坊钱包帮助类
 * @extends BaseEtherLike
 */
class EthWalletHelper extends BaseEtherLike {
  public remoteClient: Remote
  public chainId: number = 1

  constructor() {
    super()
  }

  initRemoteClient (url: string): void {
    this.remoteClient = new Remote(url)
  }

  /**
   * 获取合约的字节码
   * @param compiledContract
   * @param contractName {string} 要获取哪个合约的字节码
   * @returns {*}
   */
  getBytecodeOfContract(compiledContract, contractName) {
    if (!compiledContract['contracts'][`:${contractName}`]) {
      return null
    }
    return '0x' + compiledContract['contracts'][`:${contractName}`]['bytecode']
  }

  /**
   * 编译合约
   * @param contractStr
   * @param isOptimize
   * @returns {*}
   */
  compileContract(contractStr, isOptimize = 1) {
    const compiled = solc.compile(contractStr, isOptimize)
    if (Object.keys(compiled['contracts']).length === 0) {
      throw new ErrorHelper(compiled['errors'])
    }
    // logger.warn('compile warn: ', compiled['errors'])
    return compiled
  }

  /**
   * 使用私钥签名消息
   * @param privateKey {string} 带0x
   * @param msg
   * @returns {string}
   */
  signMessage(privateKey, msg) {
    const messageHash = EthCrypto.hash.keccak256(msg)
    return EthCrypto.sign(
      privateKey,
      messageHash
    )
  }

  /**
   * 从签名中得到签名者地址。ECDSA算法中，只能是公约加密私钥解密、私钥签名公钥验证。私钥加密公钥不能解密,只能根据签名结果以及明文得到加密者公钥
   * @param signature {string} 私钥对msg签名后的值，从中可以得到r、s、v
   * @param msg {string} 源消息
   * @returns {any}
   */
  recoverSignerAddress(signature, msg) {
    return EthCrypto.recover(
      signature,
      EthCrypto.hash.keccak256(msg) // signed message hash
    )
  }

  /**
   * 从签名中得到签名者公钥
   * @param signature
   * @param msg
   * @returns {any}
   */
  recoverSignerPublicKey(signature, msg) {
    return EthCrypto.recoverPublicKey(
      signature,
      EthCrypto.hash.keccak256(msg) // signed message hash
    )
  }

  /**
   * 使用公钥加密字符串，只有私钥能解开
   * @param publicKey {string} 不带0x
   * @param msg
   * @returns {Promise<Encrypted>}
   */
  encryptWithPublicKey(publicKey, msg) {
    return EthCrypto.encryptWithPublicKey(
      publicKey,
      msg
    )
  }

  decryptWithPrivateKey(privateKey, encryptedData) {
    return EthCrypto.decryptWithPrivateKey(
      privateKey,
      encryptedData
    )
  }

  /**
   * 获取合约的abi
   * @param compiledContract
   * @param contractName {string} 哪个合约
   * @param jsonParse {boolean} 是否需要parse
   * @returns {*}
   */
  getAbiOfContract(compiledContract, contractName, jsonParse = true) {
    if (!compiledContract['contracts'][`:${contractName}`]) {
      return null
    }
    return jsonParse === true ? JSON.parse(compiledContract['contracts'][`:${contractName}`]['interface']) : compiledContract['contracts'][`:${contractName}`]['interface']
  }

  /**
   * 获取编译器版本
   * @param compiledContract
   * @param contractName
   * @returns {*}
   */
  getCompilerVersionOfContract(compiledContract, contractName) {
    const meta = compiledContract['contracts'][`:${contractName}`]
    if (!meta) {
      return null
    }
    return JSON.parse(meta['metadata'])['compiler']['version']
  }

  /**
   * 解码txHex
   * @param txHex
   */
  decodeTxHex(txHex: string): object {
    const tx = new Tx(txHex)
    return {
      txId: '0x' + tx.hash().toString('hex'),
      nonce: tx.nonce.toDecimalString_().toNumber_(),
      gasPrice: tx.gasPrice.toDecimalString_(),
      gasLimit: tx.gasLimit.toDecimalString_(),
      to: tx.to.toHexString_(),
      value: tx.value.toDecimalString_(),
      data: tx.data.toHexString_(),
      v: tx.v.toHexString_(),
      r: tx.r.toHexString_(),
      s: tx.s.toHexString_(),
      from: tx.from.toHexString_(),
      _chainId: tx._chainId,
      _homestead: tx._homestead
    }
  }

  encryptToKeystore(pass, privateKey) {
    const dk = keythereum.create({keyBytes: 32, ivBytes: 16})
    return keythereum.dump(pass, privateKey.hexToBuffer_(), dk['salt'], dk['iv'], {
      kdf: 'pbkdf2',
      cipher: 'aes-128-ctr',
      kdfparams: {
        c: 262144,
        dklen: 32,
        prf: 'hmac-sha256'
      }
    })
  }

  decryptKeystore(keystoreStr, pass) {
    return keythereum.recover(pass, JSON.parse(keystoreStr)).toHexString_()
  }

  /**
   * 构造交易
   * @param privateKey
   * @param toAddress
   * @param amount {string} 单位wei, 十进制
   * @param nonce {number} 十进制。即发送地址已经发送过多少笔交易
   * @param gasPrice {string} 单位wei, 十进制
   * @param gasLimit {string} 单位wei, 十进制
   * @returns {string}
   */
  buildTransaction(privateKey: string, toAddress: string, amount: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '21000'): object {
    // logger.error(arguments)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    const rawTx = {
      nonce: nonce.toString().decimalToHexString_(),
      gasPrice: gasPrice.decimalToHexString_(),
      gasLimit: gasLimit.decimalToHexString_(),
      to: toAddress,
      value: amount.decimalToHexString_(),
      chainId: this.chainId,
    }

    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx['nonce'].toDecimalString_().toNumber_(),
      gasPrice: tx['gasPrice'].toDecimalString_(),
      gasLimit: tx['gasLimit'].toDecimalString_(),
      to: tx['to'].toHexString_(),
      value: tx['value'].toDecimalString_(),
      data: tx['data'].toHexString_(),
      from: tx['from'].toHexString_()
    }
  }

  buildMsgTransaction(privateKey: string, msg: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '900000') {
    // logger.error(arguments)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    const sourceAddress = this.getAddressFromPrivateKey(privateKey)
    const rawTx = {
      nonce: nonce.toString().decimalToHexString_(),
      gasPrice: gasPrice.decimalToHexString_(),
      gasLimit: gasLimit.decimalToHexString_(),
      from: sourceAddress,
      to: sourceAddress,
      value: 0x00,
      data: '0x3c5554462d383e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d20e7be8ee4b8bde79a84e58886e99a94e7aca6202d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a0a' + msg.stringToUtf8HexString_().removeFirst_(2),
      chainId: this.chainId,
    }

    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx['nonce'].toDecimalString_().toNumber_(),
      gasPrice: tx['gasPrice'].toDecimalString_(),
      gasLimit: tx['gasLimit'].toDecimalString_(),
      to: tx['to'].toHexString_(),
      value: tx['value'].toDecimalString_(),
      data: tx['data'].toHexString_(),
      from: tx['from'].toHexString_()
    }
  }

  /**
   * 构建调用智能合约交易(调用constant为false的函数修改区块链数据)
   * @param privateKey
   * @param contractAddress
   * @param methodName {string} 要调用的方法名
   * @param methodParamTypes {array} ['address', 'number']
   * @param params {array} 如 ['0x00367f9370A71Cf482A64394dFB2367aa3a34339', '100']
   * @param nonce {number} 十进制
   * @param gasPrice
   * @param gasLimit
   * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *}}
   */
  buildContractTransaction(privateKey: string, contractAddress: string, methodName: string, methodParamTypes: Array<string>, params: Array<string>, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '300000') {
    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    const rawTx = {
      from: fromAddress,
      nonce: nonce.toString().decimalToHexString_(),
      gasPrice: gasPrice.decimalToHexString_(),
      gasLimit: gasLimit.decimalToHexString_(),
      to: contractAddress,
      value: 0x00,
      data: this.encodePayload(this.getMethodId(methodName, methodParamTypes), methodParamTypes, params),
      chainId: this.chainId,
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx['nonce'].toDecimalString_().toNumber_(),
      gasPrice: tx['gasPrice'].toDecimalString_(),
      gasLimit: tx['gasLimit'].toDecimalString_(),
      to: tx['to'].toHexString_(),
      value: tx['value'].toDecimalString_(),
      data: tx['data'].toHexString_(),
      from: tx['from'].toHexString_()
    }
  }

  buildContractTx(privateKey: string, fromAddress: string, contractAddress: string, methodName: string, methodParamTypes: Array<string>, params: Array<string>, value: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '900000') {
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    const rawTx = {
      from: fromAddress,
      nonce: nonce.toString().decimalToHexString_(),
      gasPrice: gasPrice.decimalToHexString_(),
      gasLimit: gasLimit.decimalToHexString_(),
      to: contractAddress,
      value: value.decimalToHexString_(),
      data: this.encodePayload(this.getMethodId(methodName, methodParamTypes), methodParamTypes, params),
      chainId: this.chainId,
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx['nonce'].toDecimalString_().toNumber_(),
      gasPrice: tx['gasPrice'].toDecimalString_(),
      gasLimit: tx['gasLimit'].toDecimalString_(),
      to: tx['to'].toHexString_(),
      value: tx['value'].toDecimalString_(),
      data: tx['data'].toHexString_(),
      from: tx['from'].toHexString_()
    }
  }

  /**
   * 构建部署智能合约的交易
   * @param compiledContract
   * @param contractName {string} 要发布哪个Contract
   * @param privateKey
   * @param nonce {number} 十进制
   * @param gasPrice
   * @param gasLimit
   * @param constructorArgs {object} {methodParamTypes, params}
   * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *, compileVersion: *, abi: *}}
   */
  buildDeployContractTx(compiledContract, contractName, privateKey, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '3000000', constructorArgs = null) {
    // logger.error('1', arguments)
    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    let data = this.getBytecodeOfContract(compiledContract, contractName)
    if (constructorArgs !== null) {
      data += this.encodeParamsHex(constructorArgs['methodParamTypes'], constructorArgs['params'])
    }

    const rawTx = {
      from: fromAddress,
      nonce: nonce.toString().decimalToHexString_(),
      gasPrice: gasPrice.decimalToHexString_(),
      gasLimit: gasLimit.decimalToHexString_(),
      value: 0x00,
      data,
      chainId: this.chainId,
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx['nonce'].toDecimalString_().toNumber_(),
      gasPrice: tx['gasPrice'].toDecimalString_(),
      gasLimit: tx['gasLimit'].toDecimalString_(),
      to: tx['to'].toHexString_(),
      value: tx['value'].toDecimalString_(),
      data: tx['data'].toHexString_(),
      from: tx['from'].toHexString_(),
      compileVersion: this.getCompilerVersionOfContract(compiledContract, contractName),
      abi: this.getAbiOfContract(compiledContract, contractName, false)
    }
  }

  /**
   * 获取智能合约方法id
   * @param method {string} 如 transfer(address,uint256)
   * @returns {string}
   */
  getMethodIdV1(method) {
    return new Web3(``).utils.sha3(method).substr(0, 10)
  }

  getMethodId(methodName, methodParamTypes) {
    return '0x' + abiUtil.methodID(methodName, methodParamTypes).toString(`hex`)
  }

  /**
   * 解码data数据
   * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
   * @param methodParamTypes {array} ['uint256', 'address']
   */
  decodePayload(payloadTx, methodParamTypes) {
    const dataBuf = new Buffer(payloadTx.replace(/^0x/, ``), `hex`)
    const methodId = dataBuf.slice(0, 4).toString(`hex`)
    const inputsBuf = dataBuf.slice(4)
    const params = abiUtil.rawDecode(methodParamTypes, inputsBuf)
    return {
      methodIdHex: '0x' + methodId,
      params
    }
  }

  /**
   * 构建调用智能合约的data数据
   * @param methodIdHex
   * @param methodParamTypes {array} ['number', 'address']
   * @param params {array}
   * @returns {*}
   */
  encodePayload(methodIdHex, methodParamTypes, params) {
    return methodIdHex + this.encodeParamsHex(methodParamTypes, params)
  }

  /**
   * 编码参数成hex，不带0x
   * @param methodParamTypes
   * @param params
   * @returns {*}
   */
  encodeParamsHex(methodParamTypes, params) {
    return abiUtil.rawEncode(methodParamTypes, params).toHexString_(false)
  }

  decodeParamsHex(methodParamTypes, paramsHex) {
    const dataBuf = new Buffer(paramsHex.replace(/^0x/, ``), `hex`)
    return abiUtil.rawDecode(methodParamTypes, dataBuf)
  }

  encodeToTopicHex(str) {
    return EtherUtil.keccak256(str).toHexString_()
  }
}

export default EthWalletHelper
