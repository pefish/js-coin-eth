/**
 * Created by joy on 12/09/2017.
 */
import BaseCoin from './base_coin'

/**
 * 以太坊系基类
 * @extends BaseCoin
 */
class BaseEtherLike extends BaseCoin {
  constructor() {
    super()
  }

  getXprivBySeed (seedHex: string): string {
    const { HDPrivateKey } = require('bitcore-lib')
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).toString()
  }

  getXpubBySeed (seedHex: string): string {
    const { HDPrivateKey } = require('bitcore-lib')
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).hdPublicKey.toString()
  }

  /**
   * 由公钥得到地址
   * @param pubKey
   * @returns {string}
   */
  getAddressFromPubKey (pubKey: string): string {
    const { publicToAddress } = require('ethereumjs-util')
    return `0x${publicToAddress(pubKey.hexToBuffer_(), true).toString('hex')}`
  }

  isValidPublicKey (pubKey: string): boolean {
    const { isValidPublic } = require('ethereumjs-util')
    return isValidPublic(pubKey.hexToBuffer_(), true)
  }

  /**
   * 校验地址
   * @param address
   * @returns {*|Boolean}
   */
  isAddress (address: string): boolean {
    const { isValidAddress } = require('ethereumjs-util')
    return isValidAddress(address)
  }

  deriveAllByXprivPath(xpriv: string, path: string): object {
    const { HDPrivateKey } = require('bitcore-lib')
    const { publicToAddress } = require('ethereumjs-util')
    const key = new HDPrivateKey(xpriv)
    let derived = key.deriveChild(path)
    return {
      parentXpriv: xpriv,
      path: path,
      xpriv: derived.toString(),
      xpub: derived.hdPublicKey.toString(),
      address: `0x${publicToAddress(derived.publicKey.toBuffer(), true).toString('hex')}`,
      privateKey: derived.privateKey.toBuffer().toHexString_(),
      publicKey: derived.publicKey.toBuffer().toHexString_()
    }
  }

  /**
   * 根据私钥得到地址
   * @param privateKey
   * @returns {string}
   */
  getAddressFromPrivateKey (privateKey: string): string {
    const { privateToAddress } = require('ethereumjs-util')
    return `0x${privateToAddress(privateKey.hexToBuffer_()).toString('hex')}`
  }
}

export default BaseEtherLike
