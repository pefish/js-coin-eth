/**
 * Created by joy on 12/09/2017.
 */
import BaseCoin from './base_coin'
import HDKey from 'hdkey'
import { HDPrivateKey } from 'bitcore-lib'
import { publicToAddress, privateToPublic, bufferToHex, isValidPublic, isValidAddress, privateToAddress } from 'ethereumjs-util'

  /**
 * 以太坊系基类
 * @extends BaseCoin
 */
class BaseEtherLike extends BaseCoin {
  constructor() {
    super()
  }

  getXprivBySeed (seedHex: string): string {
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).toString()
  }

  getXpubBySeed (seedHex: string): string {
    return HDPrivateKey.fromSeed(seedHex, `mainnet`).hdPublicKey.toString()
  }

  /**
   * 由公钥得到地址
   * @param pubKey
   * @returns {string}
   */
  getAddressFromPubKey (pubKey: string): string {
    return `0x${publicToAddress(pubKey.hexToBuffer_(), true).toString('hex')}`
  }

  isValidPublicKey (pubKey: string): boolean {
    return isValidPublic(pubKey.hexToBuffer_(), true)
  }

  /**
   * 校验地址
   * @param address
   * @returns {*|Boolean}
   */
  isAddress (address: string): boolean {
    return isValidAddress(address)
  }

  deriveAllByXprivPath(xpriv: string, path: string): {
    parentXpriv: string,
    path: string,
    xpriv: string,
    xpub: string,
    address: string,
    privateKey: string,
    publicKey: string,
  } {
    const node = HDKey.fromExtendedKey(xpriv)
    const derivedNode = node.derive(path)
    const publicKey = privateToPublic(derivedNode._privateKey)
    return {
      parentXpriv: xpriv,
      path: path,
      xpriv: derivedNode.privateExtendedKey,
      xpub: derivedNode.publicExtendedKey,
      address: bufferToHex(publicToAddress(publicKey)),
      privateKey: bufferToHex(derivedNode._privateKey),
      publicKey: bufferToHex(publicKey),
    }
  }

  /**
   * 根据私钥得到地址
   * @param privateKey
   * @returns {string}
   */
  getAddressFromPrivateKey (privateKey: string): string {
    return `0x${privateToAddress(privateKey.hexToBuffer_()).toString('hex')}`
  }
}

export default BaseEtherLike
