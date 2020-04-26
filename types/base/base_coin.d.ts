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
    getXprivBySeed(seedHex: string): string;
    getXpubBySeed(seedHex: string): string;
    /**
     * 由公钥得到地址
     * @param pubKey
     * @returns {string}
     */
    getAddressFromPubKey(pubKey: string): string;
    isValidPublicKey(pubKey: string): boolean;
    /**
     * 校验地址
     * @param address
     * @returns {*|Boolean}
     */
    isAddress(address: string): boolean;
    deriveAllByXprivPath(xpriv: string, path: string): {
        parentXpriv: string;
        path: string;
        xpriv: string;
        xpub: string;
        address: string;
        privateKey: string;
        publicKey: string;
    };
    /**
     * 根据私钥得到地址
     * @param privateKey
     * @returns {string}
     */
    getAddressFromPrivateKey(privateKey: string): string;
}
export default BaseCoin;
