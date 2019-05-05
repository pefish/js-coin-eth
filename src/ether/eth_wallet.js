/** @module */
import 'js-node-assist'
import BaseEtherLike from '../base/base_ether_like'
import crypto from 'crypto'
import ErrorHelper from 'p-js-error'

/**
 * 以太坊钱包帮助类
 * @extends BaseEtherLike
 */
class EthWalletHelper extends BaseEtherLike {

  constructor () {
    super()
  }

  /**
   * 获取合约的字节码
   * @param compiledContract
   * @param contractName {string} 要获取哪个合约的字节码
   * @returns {*}
   */
  getBytecodeOfContract (compiledContract, contractName) {
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
  compileContract (contractStr, isOptimize = 1) {
    const solc = require('solc')
    const compiled = solc.compile(contractStr, isOptimize)
    if (!Object.keys(compiled['contracts']).length > 0) {
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
  signMessage (privateKey, msg) {
    const EthCrypto = require('eth-crypto')
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
  recoverSignerAddress (signature, msg) {
    const EthCrypto = require('eth-crypto')
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
  recoverSignerPublicKey (signature, msg) {
    const EthCrypto = require('eth-crypto')
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
  async encryptWithPublicKey (publicKey, msg) {
    const EthCrypto = require('eth-crypto')
    return EthCrypto.encryptWithPublicKey(
      publicKey,
      msg
    )
  }

  async decryptWithPrivateKey (privateKey, encryptedData) {
    const EthCrypto = require('eth-crypto')
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
  getAbiOfContract (compiledContract, contractName, jsonParse = true) {
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
  getCompilerVersionOfContract (compiledContract, contractName) {
    const meta = compiledContract['contracts'][`:${contractName}`]
    if (!meta) {
      return null
    }
    return JSON.parse(meta['metadata'])['compiler']['version']
  }

  /**
   * 解码txHex
   * @param txHex
   * @returns {{nonce: String|*, gasPrice: String|*, gasLimit: String|*, to: *, value: String|*, data: *, v: *, r: string|*, s: string|*, from: *, _chainId: *, _homestead: boolean}}
   */
  decodeTxHex (txHex) {
    const Tx = require('ethereumjs-tx')
    const tx = new Tx(txHex)
    return {
      txId: '0x' + tx.hash().toString('hex'),
      nonce: tx.nonce.toDecimalString(),
      gasPrice: tx.gasPrice.toDecimalString(),
      gasLimit: tx.gasLimit.toDecimalString(),
      to: tx.to.toHexString(),
      value: tx.value.toDecimalString(),
      data: tx.data.toHexString(),
      v: tx.v.toHexString(),
      r: tx.r.toHexString(),
      s: tx.s.toHexString(),
      from: tx.from.toHexString(),
      _chainId: tx._chainId,
      _homestead: tx._homestead
    }
  }

  encryptToKeystore (pass, privateKey) {
    const keythereum = require('keythereum')
    const dk = keythereum.create({ keyBytes: 32, ivBytes: 16 })
    return keythereum.dump(pass, privateKey.hexToBuffer(), dk['salt'], dk['iv'], {
      kdf: 'pbkdf2',
      cipher: 'aes-128-ctr',
      kdfparams: {
        c: 262144,
        dklen: 32,
        prf: 'hmac-sha256'
      }
    })
  }

  decryptKeystoreV2 (keystoreStr, pass) {
    const keythereum = require('keythereum')
    return keythereum.recover(pass, JSON.parse(keystoreStr)).toHexString()
  }

  /**
   * 解密keystore文件
   * @param v3Keystore {string}
   * @param password
   * @returns {string}
   */
  decryptKeystore (v3Keystore, password) {
    const scryptsy = require('scrypt.js')
    const Web3 = require('web3')
    const json = JSON.parse(v3Keystore)

    if (json.version !== 3) {
      throw new ErrorHelper('Not a valid V3 wallet')
    }

    let derivedKey, kdfparams
    if (json.crypto.kdf === 'scrypt') {
      kdfparams = json.crypto.kdfparams
      derivedKey = scryptsy(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams
      if (kdfparams.prf !== 'hmac-sha256') {
        throw new ErrorHelper('Unsupported parameters to PBKDF2')
      }
      derivedKey = crypto.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256')
    } else {
      throw new ErrorHelper('Unsupported key derivation scheme')
    }
    const ciphertext = new Buffer(json.crypto.ciphertext, 'hex')

    const mac = new Web3(``).utils.sha3(Buffer.concat([ derivedKey.slice(16, 32), ciphertext ])).replace('0x','')
    if (mac !== json.crypto.mac) {
      throw new ErrorHelper('Key derivation failed - possibly wrong password')
    }

    const decipher = crypto.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), new Buffer(json.crypto.cipherparams.iv, 'hex'))
    return '0x'+ Buffer.concat([ decipher.update(ciphertext), decipher.final() ]).toString('hex')
  }

  /**
   * 构造交易
   * @param privateKey
   * @param toAddress
   * @param amount {string} 单位wei, 十进制
   * @param nonce {string} 十进制。即发送地址已经发送过多少笔交易
   * @param gasPrice {string} 单位wei, 十进制
   * @param gasLimit {string} 单位wei, 十进制
   * @returns {string}
   */
  async buildTransaction (privateKey, toAddress, amount, nonce = null, gasPrice = null, gasLimit = '21000') {
    // logger.error(arguments)
    const Tx = require('ethereumjs-tx')
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    if (nonce === null) {
      const EtherscanApiHelper = require('./etherscan_api').default
      const etherScanApiHelper = new EtherscanApiHelper()
      nonce = await etherScanApiHelper.getTransactionCount(this.getAddressFromPrivateKey(privateKey))
    }
    if (!gasPrice) {
      gasPrice = '20000000000'
    }
    const rawTx = {
      nonce: nonce.decimalToHexString(),
      gasPrice: gasPrice.decimalToHexString(),
      gasLimit: gasLimit.decimalToHexString(),
      to: toAddress,
      value: amount.decimalToHexString(),
    }

    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi(gasPrice),
      nonce: tx['nonce'].toDecimalString(),
      gasPrice: tx['gasPrice'].toDecimalString(),
      gasLimit: tx['gasLimit'].toDecimalString(),
      to: tx['to'].toHexString(),
      value: tx['value'].toDecimalString(),
      data: tx['data'].toHexString(),
      from: tx['from'].toHexString()
    }
  }

  async buildMsgTransaction (privateKey, msg, nonce = null, gasPrice = null, gasLimit = null) {
    // logger.error(arguments)
    const Tx = require('ethereumjs-tx')
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    const sourceAddress = this.getAddressFromPrivateKey(privateKey)
    if (nonce === null) {
      const EtherscanApiHelper = require('./etherscan_api').default
      const etherScanApiHelper = new EtherscanApiHelper()
      nonce = await etherScanApiHelper.getTransactionCount(sourceAddress)
    }
    if (!gasPrice) {
      gasPrice = '20000000000'
    }
    if (!gasLimit) {
      gasLimit = '900000'
    }
    const rawTx = {
      nonce: nonce.decimalToHexString(),
      gasPrice: gasPrice.decimalToHexString(),
      gasLimit: gasLimit.decimalToHexString(),
      from: sourceAddress,
      to: sourceAddress,
      value: 0x00,
      data: '0x3c5554462d383e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d20e7be8ee4b8bde79a84e58886e99a94e7aca6202d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a0a' + msg.stringToUtf8HexString_().removeFirst_(2)
    }

    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi(gasPrice),
      nonce: tx['nonce'].toDecimalString(),
      gasPrice: tx['gasPrice'].toDecimalString(),
      gasLimit: tx['gasLimit'].toDecimalString(),
      to: tx['to'].toHexString(),
      value: tx['value'].toDecimalString(),
      data: tx['data'].toHexString(),
      from: tx['from'].toHexString()
    }
  }

  /**
   * 构建调用智能合约交易(调用constant为false的函数修改区块链数据)
   * @param privateKey
   * @param contractAddress
   * @param methodName {string} 要调用的方法名
   * @param methodParamTypes {array} ['address', 'number']
   * @param params {array} 如 ['0x00367f9370A71Cf482A64394dFB2367aa3a34339', '100']
   * @param nonce {string} 十进制字符串
   * @param gasPrice
   * @param gasLimit
   * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *}}
   */
  async buildContractTransaction (privateKey, contractAddress, methodName, methodParamTypes, params, nonce = null, gasPrice = null, gasLimit = null) {
    const Tx = require('ethereumjs-tx')
    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    if (nonce === null) {
      const EtherscanApiHelper = require('./etherscan_api').default
      const etherScanApiHelper = new EtherscanApiHelper()
      nonce = await etherScanApiHelper.getTransactionCount(this.getAddressFromPrivateKey(privateKey))
    }
    if (!gasPrice) {
      gasPrice = '20000000000'
    }
    if (!gasLimit) {
      gasLimit = '900000'
    }
    const rawTx = {
      from: fromAddress,
      nonce: nonce.decimalToHexString(),
      gasPrice: gasPrice.decimalToHexString(),
      gasLimit: gasLimit.decimalToHexString(),
      to: contractAddress,
      value: 0x00,
      data: this.encodePayload(this.getMethodId(methodName, methodParamTypes), methodParamTypes, params)
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi(gasPrice),
      nonce: tx['nonce'].toDecimalString(),
      gasPrice: tx['gasPrice'].toDecimalString(),
      gasLimit: tx['gasLimit'].toDecimalString(),
      to: tx['to'].toHexString(),
      value: tx['value'].toDecimalString(),
      data: tx['data'].toHexString(),
      from: tx['from'].toHexString()
    }
  }

  async buildContractTxV2 (privateKey, fromAddress, contractAddress, methodName, methodParamTypes, params, value = '0', nonce = null, gasPrice = null, gasLimit = null) {
    const Tx = require('ethereumjs-tx')
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    if (nonce === null) {
      const EtherscanApiHelper = require('./etherscan_api').default
      const etherScanApiHelper = new EtherscanApiHelper()
      nonce = await etherScanApiHelper.getTransactionCount(this.getAddressFromPrivateKey(privateKey))
    }
    if (!gasPrice) {
      gasPrice = '20000000000'
    }
    if (!gasLimit) {
      gasLimit = '900000'
    }
    const rawTx = {
      from: fromAddress,
      nonce: nonce.decimalToHexString(),
      gasPrice: gasPrice.decimalToHexString(),
      gasLimit: gasLimit.decimalToHexString(),
      to: contractAddress,
      value: value.decimalToHexString(),
      data: this.encodePayload(this.getMethodId(methodName, methodParamTypes), methodParamTypes, params)
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi(gasPrice),
      nonce: tx['nonce'].toDecimalString(),
      gasPrice: tx['gasPrice'].toDecimalString(),
      gasLimit: tx['gasLimit'].toDecimalString(),
      to: tx['to'].toHexString(),
      value: tx['value'].toDecimalString(),
      data: tx['data'].toHexString(),
      from: tx['from'].toHexString()
    }
  }

  /**
   * 构建部署智能合约的交易
   * @param compiledContract
   * @param contractName {string} 要发布哪个Contract
   * @param privateKey
   * @param nonce {string} 十进制字符串
   * @param gasPrice
   * @param gasLimit
   * @param constructorArgs {object} {methodParamTypes, params}
   * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *, compileVersion: *, abi: *}}
   */
  async buildDeployContractTx (compiledContract, contractName, privateKey, nonce = null, gasPrice = null, gasLimit = null, constructorArgs = null) {
    // logger.error('1', arguments)
    const Tx = require('ethereumjs-tx')
    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = new Buffer(privateKey, 'hex')
    if (nonce === null) {
      const EtherscanApiHelper = require('./etherscan_api').default
      const etherScanApiHelper = new EtherscanApiHelper()
      nonce = await etherScanApiHelper.getTransactionCount(this.getAddressFromPrivateKey(privateKey))
    }
    if (!gasPrice) {
      gasPrice = '20000000000'
    }
    if (!gasLimit) {
      gasLimit = '3000000'
    }

    let data = this.getBytecodeOfContract(compiledContract, contractName)
    if (constructorArgs !== null) {
      data += this.encodeParamsHex(constructorArgs['methodParamTypes'], constructorArgs['params'])
    }

    const rawTx = {
      from: fromAddress,
      nonce: nonce.decimalToHexString(),
      gasPrice: gasPrice.decimalToHexString(),
      gasLimit: gasLimit.decimalToHexString(),
      value: 0x00,
      data
    }
    const tx = new Tx(rawTx)
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi(gasPrice),
      nonce: tx['nonce'].toDecimalString(),
      gasPrice: tx['gasPrice'].toDecimalString(),
      gasLimit: tx['gasLimit'].toDecimalString(),
      to: tx['to'].toHexString(),
      value: tx['value'].toDecimalString(),
      data: tx['data'].toHexString(),
      from: tx['from'].toHexString(),
      compileVersion: this.getCompilerVersionOfContract(compiledContract, contractName),
      abi: this.getAbiOfContract(compiledContract, contractName, false)
    }
  }

  /**
   * 获取智能合约方法id
   * @param strToCalc {string} 如 transfer(address,uint256)
   * @returns {string}
   */
  getMethodIdV1 (strToCalc) {
    const Web3 = require('web3')
    return new Web3(``).utils.sha3(strToCalc).substr(0, 10)
  }

  getMethodId (methodName, methodParamTypes) {
    const abiUtil = require('./abi')
    return '0x' + abiUtil.methodID(methodName, methodParamTypes).toString(`hex`)
  }

  /**
   * 解码data数据
   * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
   * @param methodParamTypes {array} ['uint256', 'address']
   */
  decodePayload (payloadTx, methodParamTypes) {
    const abiUtil = require('./abi')
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
  encodePayload (methodIdHex, methodParamTypes, params) {
    return methodIdHex + this.encodeParamsHex(methodParamTypes, params)
  }

  /**
   * 编码参数成hex，不带0x
   * @param methodParamTypes
   * @param params
   * @returns {*}
   */
  encodeParamsHex (methodParamTypes, params) {
    const abiUtil = require('./abi')
    return abiUtil.rawEncode(methodParamTypes, params).toHexString(false)
  }

  decodeParamsHex (methodParamTypes, paramsHex) {
    const abiUtil = require('./abi')
    const dataBuf = new Buffer(paramsHex.replace(/^0x/, ``), `hex`)
    return abiUtil.rawDecode(methodParamTypes, dataBuf)
  }

  encodeToTopicHex (str) {
    const EtherUtil = require('ethereumjs-util')
    return EtherUtil.keccak256(str).toHexString()
  }

  /**
   * 调用智能合约的方法(constant为true的函数)
   * @param parityApiClient {object} parity api客户端实例
   * @param abiStr {string} 合约的abi
   * @param contractAddress {string} 合约地址
   * @param funName {string} 要调用的函数名
   * @param opts
   * @param params
   * @returns {Promise<void>}
   */
  async callContract (parityApiClient, abiStr, contractAddress, funName, opts = {}, params = []) {
    const abi = JSON.parse(abiStr)
    const contract = parityApiClient.newContract(abi, contractAddress)
    return contract.instance[funName].call(opts, params)
  }
}

export default EthWalletHelper
