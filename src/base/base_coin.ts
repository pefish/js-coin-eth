/**
 * Created by joy on 12/09/2017.
 */

import * as bip39Lib from 'bip39'
import HDKey from 'hdkey'
import { HDPrivateKey } from 'bitcore-lib'
import { publicToAddress, privateToPublic, bufferToHex, isValidPublic, isValidAddress, privateToAddress } from 'ethereumjs-util'

/**
 * 虚拟货币基类
 */
class BaseCoin {
  /**
   * 使用伪随机函数PBKDF2(将salted hash进行多次重复计算)生成随机数
   * @param mnemonic
   * @param pass
   * @returns {string} 128位hex字符串
   */
  getSeedBufferByMnemonic (mnemonic: string, pass: string = ''): Buffer {
    return bip39Lib.mnemonicToSeedSync(mnemonic, pass) // 种子buffer, password是salt, 默认是'mnemonic'
  }

  /**
   * 根据助记码得到seed hex
   * @param mnemonic
   * @param pass
   * @returns {string}
   */
  getSeedHexByMnemonic (mnemonic: string, pass: string = ''): string {
    return this.getSeedBufferByMnemonic(mnemonic, pass).toString('hex')
  }

  /**
   * 根据字典生成随机助记码
   * @returns {*}
   */
  getRandomMnemonic (): string {
    return bip39Lib.generateMnemonic()
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

export default BaseCoin
