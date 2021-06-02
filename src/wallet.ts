import BaseCoin from './base/base_coin'
import abiUtil from './abi'
import EthCrypto, { Signature } from 'eth-crypto'
import { Transaction } from 'ethereumjs-tx'
import Web3 from 'web3'
import { keccak256, privateToAddress } from 'ethereumjs-util'
import Remote, { TransactionInfo } from './remote'
import TimeUtil from '@pefish/js-util-time'
import randomBytes from 'randombytes'
import crypto from 'crypto'
import uuidv4 from 'uuid/v4'
import scryptsy from 'scryptsy'
import Common from 'ethereumjs-common';
import { StringUtil, BufferUtil } from '@pefish/js-node-assist';
import * as ethers from "ethers"
import {utils} from "ethers";


export interface TransactionResult {
  txHex: string,
  txId: string,
  dataFee: string,
  allFee: string,
  nonce: number,
  gasPrice: string,
  gasLimit: number,
  to: string,
  value: string,
  data: string,
  from: string,
  compileVersion?: string,
  abi?: { [x: string]: any },
  chainId: number,
}

export interface CompiledContractResult {
  contracts: {
    [filename: string]: {
      [contractName: string]: {
        metadata: string,
        [x: string]: any,
      },
    }
  },
  [x: string]: any,
}

export interface CompiledContractData {
  abi: {[x: string]: any}[],
  evm: {
    bytecode: {
      object
    },
    [x: string]: any,
  },
  metadata: {
    compiler: {
      version: string,
    }
    language: string,
    settings: {
      compilationTarget: {
        [fileName: string]: string,
      },
      evmVersion: string,
      optimizer: {
        enable: boolean,
        runs: number,
      },
      libraries: {[x: string]: any},
      remappings: any[],
      metadata: {
        bytecodeHash: string,
      }
    }
  }
}

const singleContractFilename = "test.sol"

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

  async init(url: string): Promise<void> {
    this.remoteClient = new Remote(url)
    this.chainId = await this.remoteClient.getChainId()
  }

  zeroAddress (): string {
    return "0x0000000000000000000000000000000000000000"
  }

  oneAddress (): string {
    return "0x0000000000000000000000000000000000000001"
  }

  maxUint256 (): string {
    return "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  }

  compileContract(contractContent: string): CompiledContractResult {
    const solcLib = require("solc")
    // 需要哪个编译器版本，就下载哪个版本的solc包
    var input = {
      language: 'Solidity',
      sources: {
        [singleContractFilename]: {
          content: contractContent,
        }
      },
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "istanbul",
        libraries: {},
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    };
    return JSON.parse(solcLib.compile(JSON.stringify(input)));
  }

  compileContractForData(contractContent: string, targetContractName: string): CompiledContractData {
    let result: CompiledContractData = null
    const output = this.compileContract(contractContent)
    for (var [contractName, data] of Object.entries(output.contracts[singleContractFilename])) {
      if (contractName === targetContractName) {
        result = data as unknown as CompiledContractData
        result.metadata = JSON.parse(data.metadata)
        return result
      }
    }
    throw new Error("no target contract")
  }

  /**
   * 使用私钥签名消息
   * @param privateKey {string} 带0x
   * @param msg
   * @returns {string}
   */
  signMessage(privateKey: string, msg: string): string {
    const messageHash = this.keccak256HashForEther(msg)
    return EthCrypto.sign(
      privateKey,
      messageHash
    )
  }

  keccak256HashForEther (msg: string): string {
    const newMsg = '\x19Ethereum Signed Message:\n' + msg.length + msg
    return this.keccak256Hash(newMsg)
  }

  /**
   * 签名字符串解码成 v、r、s
   * @param signature
   * @return 带有 0x
   */
  decodeSignature (signature: string): Signature {
    if (!signature.startsWith("0x")) {
      signature = "0x" + signature
    }
    return EthCrypto.vrs.fromString(signature);
  }

  /**
   * v、r、s 编码成签名字符串
   * @param vrs
   * @return 带有 0x
   */
  encodeSignature (vrs: Signature): string {
    if (!vrs.r.startsWith("0x")) {
      vrs.r = "0x" + vrs.r
    }
    if (!vrs.v.startsWith("0x")) {
      vrs.v = "0x" + vrs.v
    }
    if (!vrs.s.startsWith("0x")) {
      vrs.s = "0x" + vrs.s
    }
    return EthCrypto.vrs.toString(vrs);
  }

  /**
   * 从签名中得到签名者地址。ECDSA算法中，只能是公约加密私钥解密、私钥签名公钥验证。私钥加密公钥不能解密,只能根据签名结果以及明文得到加密者公钥
   * @param signature {string} 私钥对msg签名后的值，从中可以得到r、s、v
   * @param msg {string} 源消息
   */
  recoverSignerAddress(signature: string, msg: string): string {
    return this.recoverSignerAddressByMsgHash(signature, this.keccak256HashForEther(msg))
  }

  recoverSignerAddressByMsgHash(signature: string, msgHash: string): string {
    return EthCrypto.recover(
        signature,
        msgHash // signed message hash
    )
  }

  /**
   * 从签名中得到签名者公钥
   * @param signature
   * @param msg
   * @returns {any}
   */
  recoverSignerPublicKey(signature: string, msg: string): string {
    return this.recoverSignerPublicKeyByMsgHash(
      signature,
      this.keccak256HashForEther(msg)
    )
  }

  /**
   * 对字符串进行 keccak256 hash
   * @param msg
   * @return 带有 0x
   */
  keccak256Hash (msg: string): string {
    return EthCrypto.hash.keccak256(msg)
  }

  recoverSignerPublicKeyByMsgHash(signature: string, msgHash: string): string {
    return EthCrypto.recoverPublicKey(
        signature,
        msgHash // signed message hash
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
   * 解码txHex
   * @param txHex
   */
  decodeTxHex(txHex: string): {
    txId: string,
    nonce: number,
    gasPrice: string,
    gasLimit: number,
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
      nonce: StringUtil.start(BufferUtil.toDecimalString(tx.nonce)).toNumber(),
      gasPrice: BufferUtil.toDecimalString(tx.gasPrice),
      gasLimit: StringUtil.start(BufferUtil.toDecimalString(tx.gasLimit)).toNumber(),
      to: BufferUtil.toHexString(tx.to),
      value: BufferUtil.toDecimalString(tx.value),
      data: BufferUtil.toHexString(tx.data),
      v: BufferUtil.toHexString(tx.v),
      r: BufferUtil.toHexString(tx.r),
      s: BufferUtil.toHexString(tx.s),
      from: BufferUtil.toHexString(tx.getSenderAddress()),
      chainId: tx.getChainId(),
    }
  }

  encryptToKeystoreV3(pass: string, privateKey: string): string {
    const salt = Buffer.from('dc9e4a98886738bd8aae134a1f89aaa5a502c3fbd10e336136d4d5fe47448ad6', 'hex');
    const iv = Buffer.from('cecacd85e9cb89788b5aab2f93361233', 'hex');
    const uuid = Buffer.from('7e59dc028d42d09db29aa8a0f862cc81', 'hex');
    return JSON.stringify(this.toV3(StringUtil.hexToBuffer(privateKey), pass, { kdf: 'pbkdf2', uuid: uuid, salt: salt, iv: iv }))
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
    return BufferUtil.toHexString(this.fromV3(keystoreStr, pass))
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
   * @param gasLimit {number} 
   * @returns {string}
   */
  buildTranferTx(privateKey: string, toAddress: string, amount: string, nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
  }): TransactionResult {
    const gasPrice = (opts && opts.gasPrice) ? opts.gasPrice : '20000000000'
    const gasLimit = (opts && opts.gasLimit) ? opts.gasLimit : 21000

    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const rawTx = {
      nonce: StringUtil.start(nonce).toHexString().end(),
      gasPrice: StringUtil.start(gasPrice).toHexString().end(),
      gasLimit: StringUtil.start(gasLimit).toHexString().end(),
      value: StringUtil.start(amount).toHexString().end(),
      to: toAddress,
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
      dataFee: StringUtil.start(tx.getDataFee().toString(10)).multi(gasPrice).end(),
      allFee: StringUtil.start(tx.getBaseFee().toString(10)).multi(gasPrice).end(),
      nonce: StringUtil.start(BufferUtil.toDecimalString(tx.nonce)).toNumber(),
      gasPrice: BufferUtil.toDecimalString(tx.gasPrice),
      gasLimit: StringUtil.start(BufferUtil.toDecimalString(tx.gasLimit)).toNumber(),
      to: BufferUtil.toHexString(tx.to),
      value: BufferUtil.toDecimalString(tx.value),
      data: BufferUtil.toHexString(tx.data),
      from: this.getAddressFromPrivateKey(privateKey),
      chainId: tx.getChainId(),
    }
  }

  /**
   * 构建文本交易
   * @param privateKey 
   * @param msg {string} 文本信息
   * @param nonce {number} nonce
   * @param gasPrice {string} 单位wei, 十进制
   * @param gasLimit {number} 
   */
  buildMsgTx(privateKey: string, msg: string, nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
    value?: string,
  }): TransactionResult {
    const gasPrice = (opts && opts.gasPrice) ? opts.gasPrice : '20000000000'
    const gasLimit = (opts && opts.gasLimit) ? opts.gasLimit : 900000
    const value = (opts && opts.value) ? opts.value : "0"

    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const sourceAddress = this.getAddressFromPrivateKey(privateKey)
    const rawTx = {
      nonce: StringUtil.start(nonce).toHexString().end(),
      gasPrice: StringUtil.start(gasPrice).toHexString().end(),
      gasLimit: StringUtil.start(gasLimit).toHexString().end(),
      value: StringUtil.start(value).toHexString().end(),
      from: sourceAddress,
      to: sourceAddress,
      data: '0x3c5554462d383e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d20e7be8ee4b8bde79a84e58886e99a94e7aca6202d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a0a' + StringUtil.removeFirst(StringUtil.toUtf8HexString(msg), 2),
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
      dataFee: StringUtil.start(tx.getDataFee().toString(10)).multi(gasPrice).end(),
      allFee: StringUtil.start(tx.getBaseFee().toString(10)).multi(gasPrice).end(),
      nonce: StringUtil.start(BufferUtil.toDecimalString(tx.nonce)).toNumber(),
      gasPrice: BufferUtil.toDecimalString(tx.gasPrice),
      gasLimit: StringUtil.start(BufferUtil.toDecimalString(tx.gasLimit)).toNumber(),
      to: BufferUtil.toHexString(tx.to),
      value: BufferUtil.toDecimalString(tx.value),
      data: BufferUtil.toHexString(tx.data),
      from: sourceAddress,
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
   * @param gasPrice {string} 单位wei, 十进制
   * @param gasLimit {number} 
   */
  buildContractTx(privateKey: string, contractAddress: string, methodName: string, methodParamTypes: string[], params: any[], nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
    value?: string,
  }): TransactionResult {
    const gasPrice = (opts && opts.gasPrice) ? opts.gasPrice : '20000000000'
    const gasLimit = (opts && opts.gasLimit) ? opts.gasLimit : 300000
    const value = (opts && opts.value) ? opts.value : "0"

    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
    const rawTx = {
      from: fromAddress,
      nonce: StringUtil.start(nonce).toHexString().end(),
      gasPrice: StringUtil.start(gasPrice).toHexString().end(),
      gasLimit: StringUtil.start(gasLimit).toHexString().end(),
      to: contractAddress,
      value: StringUtil.start(value).toHexString().end(),
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
      dataFee: StringUtil.start(tx.getDataFee().toString(10)).multi(gasPrice).end(),
      allFee: StringUtil.start(tx.getBaseFee().toString(10)).multi(gasPrice).end(),
      nonce: StringUtil.start(BufferUtil.toDecimalString(tx.nonce)).toNumber(),
      gasPrice: BufferUtil.toDecimalString(tx.gasPrice),
      gasLimit: StringUtil.start(BufferUtil.toDecimalString(tx.gasLimit)).toNumber(),
      to: BufferUtil.toHexString(tx.to),
      value: BufferUtil.toDecimalString(tx.value),
      data: BufferUtil.toHexString(tx.data),
      from: fromAddress,
      chainId: tx.getChainId(),
    }
  }

  /**
   * 
   * @param privateKey 
   * @param contractAddress 
   * @param toAddress 
   * @param amount {string} 单位wei, 十进制
   * @param nonce 
   */
  buildTokenTransferTx(privateKey: string, contractAddress: string, toAddress: string, amount: string, nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
    value?: string,
  }): TransactionResult {
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
      opts,
    )
  }

  /**
   * 构建原生交易，传入data
   * @param data {string} data数据
   * @param privateKey
   * @param nonce {number} 十进制
   */
  buildRawTx(data: string, privateKey: string, nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
    value?: string,
  }): TransactionResult {
    const gasPrice = (opts && opts.gasPrice) ? opts.gasPrice : '20000000000'
    const gasLimit = (opts && opts.gasLimit) ? opts.gasLimit : 300000
    const value = (opts && opts.value) ? opts.value : "0"

    const fromAddress = this.getAddressFromPrivateKey(privateKey)
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.substring(2, privateKey.length)
    }
    if (!data.startsWith('0x')) {
      data = "0x" + data
    }
    const privateKeyBuffer = Buffer.from(privateKey, 'hex')

    const rawTx = {
      from: fromAddress,
      nonce: StringUtil.start(nonce).toHexString().end(),
      gasPrice: StringUtil.start(gasPrice).toHexString().end(),
      gasLimit: StringUtil.start(gasLimit).toHexString().end(),
      value: StringUtil.start(value).toHexString().end(),
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
      dataFee: StringUtil.start(tx.getDataFee().toString(10)).multi(gasPrice).end(),
      allFee: StringUtil.start(tx.getBaseFee().toString(10)).multi(gasPrice).end(),
      nonce: StringUtil.start(BufferUtil.toDecimalString(tx.nonce)).toNumber(),
      gasPrice: BufferUtil.toDecimalString(tx.gasPrice),
      gasLimit: StringUtil.start(BufferUtil.toDecimalString(tx.gasLimit)).toNumber(),
      to: BufferUtil.toHexString(tx.to),
      value: BufferUtil.toDecimalString(tx.value),
      data: BufferUtil.toHexString(tx.data),
      from: fromAddress,
      chainId: tx.getChainId(),
    }
  }

  /**
   * 获取智能合约方法id
   * @param method {string} 如 transfer(address,uint256)
   * @returns {string} 带有 0x
   */
  getMethodIdV1(method: string): string {
    return new Web3(``).utils.sha3(method).substr(0, 10)
  }

  getMethodIdV2(method: string): string {
    return utils.id(method).substr(0, 10)
  }

  getMethodId(methodName: string, methodParamTypes: string[]): string {
    return '0x' + abiUtil.methodID(methodName, methodParamTypes).toString(`hex`)
  }

  /**
   * 解码data数据
   * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
   * @param methodParamTypes {array} ['uint256', 'address']
   */
  decodePayload(methodParamTypes: string[], payloadTx: string): {
    methodIdHex: string,
    params: any[],
  } {
    const dataBuf = Buffer.from(payloadTx.replace(/^0x/, ``), `hex`)
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
  encodePayload(methodIdHex: string, methodParamTypes: string[], params: any[]): string {
    return methodIdHex + this.encodeParamsHex(methodParamTypes, params)
  }

  /**
   * 编码参数成hex，不带0x
   * @param methodParamTypes
   * @param params
   * @returns {*}
   */
  encodeParamsHex(methodParamTypes: string[], params: any[]): string {
    return BufferUtil.toHexString(abiUtil.rawEncode(methodParamTypes, params), false)
  }

  encodeParamsHexV2(methodParamTypes:(string | ethers.ethers.utils.ParamType)[], params: any[]): string {
    const result = ethers.utils.defaultAbiCoder.encode(methodParamTypes, params)
    return result.substring(2)
  }

  decodeParamsHex(methodParamTypes: string[], paramsHex: string): any[] {
    const dataBuf = Buffer.from(paramsHex.replace(/^0x/, ``), `hex`)
    return abiUtil.rawDecode(methodParamTypes, dataBuf)
  }

  decodeParamsHexV2(methodParamTypes: (string | ethers.ethers.utils.ParamType)[], paramsHex: string): any[] {
    if (!paramsHex.startsWith("0x")) {
      paramsHex = "0x" + paramsHex
    }
    return ethers.utils.defaultAbiCoder.decode(methodParamTypes, paramsHex).slice()
  }

  encodeToTopicHex(str: string): string {
    return BufferUtil.toHexString(keccak256(str))
  }

  /**
   * 同步性转账
   * @param privateKey 
   * @param toAddress 
   * @param amount 数量（单位最小）
   * @param nonce 
   * @param gasPrice {string} 单位wei, 十进制
   * @param gasLimit {number} 
   */
  async syncTransfer(privateKey: string, toAddress: string, amount: string, nonce: number, opts?: {
    gasPrice?: string,
    gasLimit?: number,
  }): Promise<void> {
    let tran = await this.buildTranferTx(
      privateKey,
      toAddress,
      amount,
      nonce,
      opts,
    )
    await this.remoteClient.wrapRequest(`sendRawTransaction`, [tran.txHex])

    await this.waitConfirm(tran.txId, false)
  }

  async waitConfirm (txHash: string, printLog: boolean = true): Promise<TransactionInfo> {
    let tx: TransactionInfo
    while (true) {
      try {
        tx = await this.remoteClient.getTransactionByHash(txHash)
        if (tx && tx.blockNumber && StringUtil.start(tx.blockNumber.toString(10)).gt(100)) {
          break
        }
      } catch (err) {
        console.error(err)
      }
      printLog && console.log(`${txHash} 未确认`)
      await TimeUtil.sleep(3000)
    }
    printLog && console.log(`${txHash} 已确认！！`)
    return tx
  }
}

