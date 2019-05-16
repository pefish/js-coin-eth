/**
 * Created by joy on 12/09/2017.
 */
import BaseCoin from './base_coin';
/**
 * 以太坊系基类
 * @extends BaseCoin
 */
declare class BaseEtherLike extends BaseCoin {
    constructor();
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
    deriveAllByXprivPath(xpriv: string, path: string): object;
    /**
     * 根据私钥得到地址
     * @param privateKey
     * @returns {string}
     */
    getAddressFromPrivateKey(privateKey: string): string;
}
export default BaseEtherLike;
