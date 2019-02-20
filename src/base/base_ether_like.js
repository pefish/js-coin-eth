/**
 * Created by joy on 12/09/2017.
 */
import BaseCoin from './base_coin'
import {
  privateToAddress,
  publicToAddress,
  isValidAddress,
  isValidPublic
} from 'ethereumjs-util'
import { HDPrivateKey, HDPublicKey } from 'bitcore-lib'

/**
 * 以太坊系基类
 * @extends BaseCoin
 */
class BaseEtherLike extends BaseCoin {
  constructor() {
    super()
  }

  getXprivBySeed (seedHex) {
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).toString()
  }

  getXpubBySeed (seedHex) {
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).hdPublicKey.toString()
  }

  /**
   * 由公钥得到地址
   * @param pubKey
   * @returns {string}
   */
  getAddressFromPubKey (pubKey) {
    return `0x${publicToAddress(pubKey.hexToBuffer(), true).toString('hex')}`
  }

  isValidPublicKey (pubKey) {
    return isValidPublic(pubKey.hexToBuffer(), true)
  }

  /**
   * 校验地址
   * @param address
   * @returns {*|Boolean}
   */
  isAddress (address) {
    return isValidAddress(address)
  }

  deriveAllByXprivPath(xpriv, path) {
    const key = new HDPrivateKey(xpriv)
    let derived = key.deriveChild(path)
    return {
      parentXpriv: xpriv,
      path: path,
      xpriv: derived.toString(),
      xpub: derived.hdPublicKey.toString(),
      address: `0x${publicToAddress(derived.publicKey.toBuffer(), true).toString('hex')}`,
      privateKey: derived.privateKey.toBuffer().toHexString(),
      publicKey: derived.publicKey.toBuffer().toHexString()
    }
  }

  /**
   * 根据私钥得到地址
   * @param privateKey
   * @returns {string}
   */
  getAddressFromPrivateKey (privateKey) {
    return `0x${privateToAddress(privateKey.hexToBuffer()).toString('hex')}`
  }
}

export default BaseEtherLike
