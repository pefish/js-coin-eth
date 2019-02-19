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
    this._parts = [
      `44'`, // bip 44
      `60'`,  // coin
      `0'`,  // wallet
      `0`    // 0 - public, 1 = private
      // index
    ]
  }

  /**
   * 由seed得到根私钥节点(节点分为公钥节点和私钥节点，公钥节点没有权限得到私钥信息)
   * @param seedHex
   * @returns {HDPrivateKey}
   */
  getHdPrivKeyBySeed (seedHex) {
    return require('bitcore-lib').HDPrivateKey.fromSeed(seedHex)
  }

  /**
   * 由主私钥得到根节点
   * @param xpriv
   */
  getHdPrivKeyByXpriv (xpriv) {
    return require('bitcore-lib').HDPrivateKey.fromString(xpriv)
  }

  /**
   * 由私钥节点得到地址
   * @param hdPrivKeyObj
   * @returns {string}
   */
  getAddressFromHdPrivKey (hdPrivKeyObj) {
    let address = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        hdPrivKeyObj.publicKey.toBuffer()
      )
    )
    return `0x${address.toString('hex')}`
  }

  /**
   * 由公钥节点得到地址
   * @param hdPubKey
   * @returns {string}
   */
  getAddressFromHdPubKey (hdPubKey) {
    let address = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        hdPubKey.toBuffer()
      )
    )
    return `0x${address.toString('hex')}`
  }

  _bip32PublicToEthereumPublic(pubKey) {
    const elliptic = require('elliptic')
    let key = elliptic.ec('secp256k1').keyFromPublic(pubKey).getPublic().toJSON()
    return Buffer.concat([new Buffer(key[0].toArray()), new Buffer(key[1].toArray())])
  }

  /**
   * 由节点和index推导出地址
   * @param hdKey
   * @param index
   * @returns {string}
   */
  getAddress(hdKey, index) {
    let path = this._parts.slice(hdKey.depth)
    // 'm/44/60/0/0/{index}'
    let derived = hdKey.derive('m/' + (path.length > 0 ? path.join('/') + '/' : "") + index)
    let address = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        derived.publicKey.toBuffer()
      )
    )
    return `0x${address.toString('hex')}`
  }

  /**
   * 校验地址
   * @param address
   * @returns {*|Boolean}
   */
  isAddress (address) {
    const Web3 = require('web3')
    return new Web3().utils.isAddress(address)
  }

  /**
   * 根据上一个和index推导出下级节点所有信息
   * @param hdPrivKeyObj
   * @param index
   * @returns {{parentXpriv: string, path: string, xpriv: string, xpub: string, address: string, wif: string, pubWif: string}}
   */
  deriveAllByHdPrivKeyIndex(hdPrivKeyObj, index) {
    let tempPath = this._parts.slice(hdPrivKeyObj.depth)
    const path = 'm/' + (tempPath.length > 0 ? tempPath.join('/') + '/' : "") + index
    let derived = hdPrivKeyObj.derive(path)
    let addressBuffer = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        derived.publicKey.toBuffer()
      )
    )
    return {
      parentXpriv: hdPrivKeyObj.toString(),
      path: path,
      xpriv: derived.toString(),
      xpub: derived.hdPublicKey.toString(),
      address: `0x${addressBuffer.toString('hex')}`,
      privateKey: derived.privateKey.toBuffer().toHexString(),
      publicKey: derived.publicKey.toBuffer().toHexString()
    }
  }

  /**
   * 根据上一个和path推导出下级节点所有信息
   * @param hdPrivKeyObj
   * @param path
   * @returns {{parentXpriv: string, path: string, xpriv: string, xpub: string, address: string, privateKey: string, publicKey: string}}
   */
  deriveAllByHdPrivKeyPath(hdPrivKeyObj, path) {
    let derived = hdPrivKeyObj.derive(path)
    let addressBuffer = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        derived.publicKey.toBuffer()
      )
    )
    return {
      parentXpriv: hdPrivKeyObj.toString(),
      path: path,
      xpriv: derived.toString(),
      xpub: derived.hdPublicKey.toString(),
      address: `0x${addressBuffer.toString('hex')}`,
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
    const bitcoreLib = require('bitcore-lib')
    if (privateKey.startsWith('0x')) {
      privateKey = privateKey.removeFirst(2)
    }
    const privateKeyObj = new bitcoreLib.PrivateKey(privateKey, bitcoreLib.Networks.get())
    const publicKeyObj = privateKeyObj.toPublicKey()
    const addressBuffer = this._pubToAddress(
      this._bip32PublicToEthereumPublic(
        publicKeyObj.toBuffer()
      )
    )
    return `0x${addressBuffer.toString('hex')}`
  }

  _pubToAddress (pubKey, sanitize) {
    if (sanitize && (pubKey.length !== 64)) {
      const secp256k1 = require('secp256k1')
      pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1)
    }
    // AssertUtil.is(pubKey.length, 64)
    // Only take the lower 160bits of the hash
    return this._sha3(pubKey).slice(-20)
  }

  _sha3 (a, bits) {
    if (!bits) bits = 256
    const createKeccakHash = require('keccak')
    return createKeccakHash('keccak' + bits).update(a).digest()
  }
}

export default BaseEtherLike
