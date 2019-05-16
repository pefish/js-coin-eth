/**
 * Created by joy on 12/09/2017.
 */
/**
 * 虚拟货币基类
 */
declare class BaseCoin {
    /**
     * 使用伪随机函数PBKDF2(将salted hash进行多次重复计算)生成随机数
     * @param mnemonic
     * @param pass
     * @returns {string} 128位hex字符串
     */
    getSeedBufferByMnemonic(mnemonic: string, pass?: string): Buffer;
    /**
     * 根据助记码得到seed hex
     * @param mnemonic
     * @param pass
     * @returns {string}
     */
    getSeedHexByMnemonic(mnemonic: string, pass?: string): string;
    /**
     * 根据字典生成随机助记码
     * @returns {*}
     */
    getRandomMnemonic(): string;
}
export default BaseCoin;
