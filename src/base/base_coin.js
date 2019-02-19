/**
 * Created by joy on 12/09/2017.
 */

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
  getSeedBufferByMnemonic (mnemonic, pass = '') {
    const bip39Lib = require('bip39')
    return bip39Lib.mnemonicToSeed(mnemonic, pass) // 种子buffer, password是salt, 默认是'mnemonic'
  }

  /**
   * 根据助记码得到seed hex
   * @param mnemonic
   * @param pass
   * @returns {string}
   */
  getSeedHexByMnemonic (mnemonic, pass = '') {
    return this.getSeedBufferByMnemonic(mnemonic, pass).toString('hex')
  }

  /**
   * 根据字典生成随机助记码
   * @returns {*}
   */
  getRandomMnemonic () {
    const bip39Lib = require('bip39')
    return bip39Lib.generateMnemonic()
  }
}

export default BaseCoin
