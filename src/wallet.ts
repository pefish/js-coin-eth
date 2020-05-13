
/*
chainId = (v - 35)/2
or
chainId = (v - 36)/2
*/

import '@pefish/js-node-assist'
import BaseCoin from './base/base_coin'
import ErrorHelper from '@pefish/js-error'
import abiUtil from './abi'
import solc from 'solc'
import EthCrypto from 'eth-crypto'
import { Transaction } from 'ethereumjs-tx'
import Web3 from 'web3'
import { keccak256, privateToAddress } from 'ethereumjs-util'
import Remote from './remote'
import TimeUtil from '@pefish/js-util-time'
import randomBytes from 'randombytes'
import crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import scryptsy from 'scryptsy'
import Common from 'ethereumjs-common';
export interface TransactionResult {
  txHex: string,
  txId: string,
  dataFee: string,
  allFee: string,
  nonce: number,
  gasPrice: string,
  gasLimit: string,
  to: string,
  value: string,
  data: string,
  from: string,
  compileVersion?: string,
  abi?: { [x: string]: any },
  chainId: number,
}

/**
 * 以太坊钱包帮助类
 * @extends BaseEtherLike
 */
export default class EthWallet extends BaseCoin {
  public remoteClient: Remote
  public chainId: number = 1

  constructor() {
    super()
  }

  initRemoteClient(url: string): void {
    this.remoteClient = new Remote(url)
  }

  setChainId(chainId: number): void {
    this.chainId = chainId
  }

  /**
   * 获取合约的字节码
   * @param compiledContract
   * @param contractName {string} 要获取哪个合约的字节码
   * @returns {*}
   */
  getBytecodeOfContract(compiledContract: any, contractName: string): string {
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
  compileContract(contractStr: string, isOptimize: number = 1): boolean {
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
  signMessage(privateKey: string, msg: string): string {
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
   */
  recoverSignerAddress(signature: string, msg: string): string {
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
  recoverSignerPublicKey(signature: string, msg: string): string {
    return EthCrypto.recoverPublicKey(
      signature,
      EthCrypto.hash.keccak256(msg) // signed message hash
    )
  }

  /**
   * 使用公钥加密字符串，只有私钥能解开
   */
  async encryptWithPublicKey(publicKey: string, msg: string): Promise<string> {
    return EthCrypto.cipher.stringify(await EthCrypto.encryptWithPublicKey(
      publicKey,
      msg
    ))
  }

  async decryptWithPrivateKey(privateKey: string, encryptedString: string): Promise<string> {
    return await EthCrypto.decryptWithPrivateKey(
      privateKey,
      EthCrypto.cipher.parse(encryptedString)
    )
  }

  /**
   * 获取合约的abi
   * @param compiledContract
   * @param contractName {string} 哪个合约
   * @param jsonParse {boolean} 是否需要parse
   * @returns {*}
   */
  getAbiOfContract(compiledContract: any, contractName: string, jsonParse: boolean = true): { [x: string]: any } {
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
  getCompilerVersionOfContract(compiledContract: any, contractName: string): string {
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
  decodeTxHex(txHex: string): {
    txId: string,
    nonce: number,
    gasPrice: string,
    gasLimit: string,
    to: string,
    value: string,
    data: string,
    v: string,
    r: string,
    s: string,
    from: string,
    chainId: number,
  } {
    const tx = new Transaction(txHex, {
      common: Common.forCustomChain('mainnet', {
        chainId: this.chainId,
      }, "byzantium"),
    })
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
      from: tx[`from`].toHexString_(),
      chainId: tx.getChainId(),
    }
  }

  encryptToKeystoreV3(pass: string, privateKey: string): string {
    const salt = Buffer.from('dc9e4a98886738bd8aae134a1f89aaa5a502c3fbd10e336136d4d5fe47448ad6', 'hex');
    const iv = Buffer.from('cecacd85e9cb89788b5aab2f93361233', 'hex');
    const uuid = Buffer.from('7e59dc028d42d09db29aa8a0f862cc81', 'hex');
    return JSON.stringify(this.toV3(privateKey.hexToBuffer_(), pass, { kdf: 'pbkdf2', uuid: uuid, salt: salt, iv: iv }))
  }

  private toV3(privateKey: Buffer, password: string, opts?: any): any {
    const v3Params = {
      cipher: 'aes-128-ctr',
      kdf: 'scrypt',
      salt: randomBytes(32),
      iv: randomBytes(16),
      uuid: randomBytes(16),
      dklen: 32,
      c: 262144,
      n: 262144,
      r: 8,
      p: 1,
      ...opts,
    }

    let kdfParams
    let derivedKey: Buffer
    switch (v3Params.kdf) {
      case `pbkdf2`:
        kdfParams = {
          dklen: v3Params.dklen,
          salt: v3Params.salt,
          c: v3Params.c,
          prf: 'hmac-sha256',
        }
        derivedKey = crypto.pbkdf2Sync(
          Buffer.from(password),
          kdfParams.salt,
          kdfParams.c,
          kdfParams.dklen,
          'sha256',
        )
        break
      case `scrypt`:
        kdfParams = {
          dklen: opts.dklen,
          salt: opts.salt,
          n: opts.n,
          r: opts.r,
          p: opts.p,
        }
        // FIXME: support progress reporting callback
        derivedKey = scryptsy(
          Buffer.from(password),
          kdfParams.salt,
          kdfParams.n,
          kdfParams.r,
          kdfParams.p,
          kdfParams.dklen,
        )
        break
      default:
        throw new Error('Unsupported kdf')
    }

    const cipher: crypto.Cipher = crypto.createCipheriv(
      v3Params.cipher,
      derivedKey.slice(0, 16),
      v3Params.iv,
    )
    if (!cipher) {
      throw new Error('Unsupported cipher')
    }

    const ciphertext = Buffer.concat([cipher.update(privateKey), cipher.final()])
    const mac = keccak256(
      Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext)]),
    )
    return {
      version: 3,
      id: uuidv4({ random: v3Params.uuid }),
      // @ts-ignore - the official V3 keystore spec omits the address key
      address: privateToAddress(privateKey).toString('hex'),
      crypto: {
        ciphertext: ciphertext.toString('hex'),
        cipherparams: { iv: v3Params.iv.toString('hex') },
        cipher: v3Params.cipher,
        kdf: v3Params.kdf,
        kdfparams: {
          ...kdfParams,
          salt: kdfParams.salt.toString('hex'),
        },
        mac: mac.toString('hex'),
      },
    }
  }

  decryptKeystoreV3(keystoreStr: string, pass: string): string {
    return this.fromV3(keystoreStr, pass).toHexString_()
  }

  private fromV3(
    input: string,
    password: string,
    nonStrict: boolean = false,
  ): Buffer {
    const json = JSON.parse(nonStrict ? input.toLowerCase() : input)

    if (json.version !== 3) {
      throw new Error('Not a V3 wallet')
    }

    let derivedKey: Buffer, kdfparams: any
    if (json.crypto.kdf === 'scrypt') {
      kdfparams = json.crypto.kdfparams

      // FIXME: support progress reporting callback
      derivedKey = scryptsy(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.n,
        kdfparams.r,
        kdfparams.p,
        kdfparams.dklen,
      )
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams

      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2')
      }

      derivedKey = crypto.pbkdf2Sync(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.c,
        kdfparams.dklen,
        'sha256',
      )
    } else {
      throw new Error('Unsupported key derivation scheme')
    }

    const ciphertext = Buffer.from(json.crypto.ciphertext, 'hex')
    const mac = keccak256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))
    if (mac.toString('hex') !== json.crypto.mac) {
      throw new Error('Key derivation failed - possibly wrong passphrase')
    }

    const decipher = crypto.createDecipheriv(
      json.crypto.cipher,
      derivedKey.slice(0, 16),
      Buffer.from(json.crypto.cipherparams.iv, 'hex'),
    )
    const seed = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return seed
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
  buildTranferTx(privateKey: string, toAddress: string, amount: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '21000'): TransactionResult {
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
    }
    const tx = new Transaction(rawTx, {
      common: Common.forCustomChain('mainnet', {
        chainId: this.chainId,
      }, "byzantium"),
    })
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx.nonce.toDecimalString_().toNumber_(),
      gasPrice: tx.gasPrice.toDecimalString_(),
      gasLimit: tx.gasLimit.toDecimalString_(),
      to: tx.to.toHexString_(),
      value: tx.value.toDecimalString_(),
      data: tx.data.toHexString_(),
      from: tx['from'].toHexString_(),
      chainId: tx.getChainId(),
    }
  }

  buildMsgTx(privateKey: string, msg: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '900000'): TransactionResult {
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
    }

    const tx = new Transaction(rawTx, {
      common: Common.forCustomChain('mainnet', {
        chainId: this.chainId,
      }, "byzantium"),
    })
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx.nonce.toDecimalString_().toNumber_(),
      gasPrice: tx.gasPrice.toDecimalString_(),
      gasLimit: tx.gasLimit.toDecimalString_(),
      to: tx.to.toHexString_(),
      value: tx.value.toDecimalString_(),
      data: tx.data.toHexString_(),
      from: tx['from'].toHexString_(),
      chainId: tx.getChainId(),
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
   */
  buildContractTx(privateKey: string, contractAddress: string, methodName: string, methodParamTypes: string[], params: string[], nonce: number, gasPrice: string = '20000000000', gasLimit: string = '300000'): TransactionResult {
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
    }
    const tx = new Transaction(rawTx, {
      common: Common.forCustomChain('mainnet', {
        chainId: this.chainId,
      }, "byzantium"),
    })
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx.nonce.toDecimalString_().toNumber_(),
      gasPrice: tx.gasPrice.toDecimalString_(),
      gasLimit: tx.gasLimit.toDecimalString_(),
      to: tx.to.toHexString_(),
      value: tx.value.toDecimalString_(),
      data: tx.data.toHexString_(),
      from: tx['from'].toHexString_(),
      chainId: tx.getChainId(),
    }
  }

  buildTokenTransferTx(privateKey: string, contractAddress: string, toAddress: string, amount: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '900000'): TransactionResult {
    return this.buildContractTx(
      privateKey,
      contractAddress,
      'transfer',
      [
        'address',
        'uint256'
      ], [
        toAddress,
        amount,
      ],
      nonce,
      gasPrice,
      gasLimit
    )
  }

  /**
   * 编译出部署合约的data内容
   * @param compiledContract
   * @param contractName  部署的合约名
   * @param constructorArgs {object} {methodParamTypes, params}
   */
  getTxDataFromCompiledContract (compiledContract: any, contractName: string, constructorArgs: {
    methodParamTypes: string[],
    params: any[],
  }) {
    let data = this.getBytecodeOfContract(compiledContract, contractName)
    if (constructorArgs !== null) {
      data += this.encodeParamsHex(constructorArgs.methodParamTypes, constructorArgs.params)
    }
    return data
  }

  /**
   * 构建原生交易，传入data
   * @param data {string} data数据
   * @param privateKey
   * @param nonce {number} 十进制
   * @param gasPrice
   * @param gasLimit
   */
  buildRawTx(data: string, privateKey: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '3000000'): TransactionResult {
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
      value: 0x00,
      data,
    }
    const tx = new Transaction(rawTx, {
      common: Common.forCustomChain('mainnet', {
        chainId: this.chainId,
      }, "byzantium"),
    })
    tx.sign(privateKeyBuffer)
    const serializedTx = tx.serialize()
    return {
      txHex: '0x' + serializedTx.toString('hex'),
      txId: '0x' + tx.hash().toString('hex'),
      dataFee: tx.getDataFee().toString(10).multi_(gasPrice),
      allFee: tx.getBaseFee().toString(10).multi_(gasPrice),
      nonce: tx.nonce.toDecimalString_().toNumber_(),
      gasPrice: tx.gasPrice.toDecimalString_(),
      gasLimit: tx.gasLimit.toDecimalString_(),
      to: tx.to.toHexString_(),
      value: tx.value.toDecimalString_(),
      data: tx.data.toHexString_(),
      from: tx['from'].toHexString_(),
      chainId: tx.getChainId(),
    }
  }

  /**
   * 获取智能合约方法id
   * @param method {string} 如 transfer(address,uint256)
   * @returns {string}
   */
  getMethodIdV1(method: string): string {
    return new Web3(``).utils.sha3(method).substr(0, 10)
  }

  getMethodId(methodName: string, methodParamTypes: string[]): string {
    return '0x' + abiUtil.methodID(methodName, methodParamTypes).toString(`hex`)
  }

  /**
   * 解码data数据
   * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
   * @param methodParamTypes {array} ['uint256', 'address']
   */
  decodePayload(payloadTx: string, methodParamTypes: string[]): {
    methodIdHex: string,
    params: any[],
  } {
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
  encodePayload(methodIdHex: string, methodParamTypes: string[], params: string[]): string {
    return methodIdHex + this.encodeParamsHex(methodParamTypes, params)
  }

  /**
   * 编码参数成hex，不带0x
   * @param methodParamTypes
   * @param params
   * @returns {*}
   */
  encodeParamsHex(methodParamTypes: string[], params: string[]): string {
    return abiUtil.rawEncode(methodParamTypes, params).toHexString_(false)
  }

  decodeParamsHex(methodParamTypes: string[], paramsHex: string): any[] {
    const dataBuf = new Buffer(paramsHex.replace(/^0x/, ``), `hex`)
    return abiUtil.rawDecode(methodParamTypes, dataBuf)
  }

  encodeToTopicHex(str: string): string {
    return keccak256(str).toHexString_()
  }

  /**
   * 同步性转账
   * @param privateKey 
   * @param toAddress 
   * @param amount 数量（单位最小）
   * @param nonce 
   * @param gasPrice 
   * @param gasLimit 
   */
  async syncTransfer(privateKey: string, toAddress: string, amount: string, nonce: number, gasPrice: string = '20000000000', gasLimit: string = '21000'): Promise<void> {
    let tran = await this.buildTranferTx(
      privateKey,
      toAddress,
      amount,
      nonce,
      gasPrice,
      gasLimit
    )
    await this.remoteClient.wrapRequest(`eth`, `sendRawTransaction`, [tran.txHex])

    while (true) {
      try {
        const tx = await this.remoteClient.wrapRequest(`eth`, `getTransactionByHash`, [tran.txId])
        if (tx && tx.blockNumber && tx.blockNumber.toString(10).gt_(100)) {
          break
        }
      } catch (err) {
        console.error(err)
      }
      await TimeUtil.sleep(3000)
    }
  }
}

