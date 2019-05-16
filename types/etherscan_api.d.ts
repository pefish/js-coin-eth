export default class EtherscanApiHelper {
    _invalid: boolean;
    _baseUrl: string;
    _apiKey: string;
    constructor(network?: string);
    getTokenBalance(contractAddress: string, address: string): Promise<string>;
    getTransactionCount(address: string): Promise<string>;
    sendRawTransaction(txHex: string): Promise<any>;
    blockNumber(): Promise<string>;
    /**
     * 根据高度获取块数据
     * @param height {number | string} 十进制
     * @param boolean {boolean} 是否显示txs
     * @returns {Promise<number|*|*>}
     */
    getBlockByNumber(height: number | string, boolean?: boolean): Promise<any>;
    getTransactionByHash(txHash: string): Promise<any>;
    getTransactionReceipt(txHash: string): Promise<any>;
    getTransactionByAddress(address: string, page: number, offset: number): Promise<any>;
    gasPrice(): Promise<string>;
    /**
     * 取余额，单位wei, 十进制
     * @param address
     * @returns {Promise<string>}
     */
    getBalance(address: string): Promise<string>;
}
