import Api from '@parity/api';
export default class Remote {
    timeout: number;
    client: Api;
    constructor(url: string);
    timeoutFunc(): Promise<any>;
    wrapRequest(moduleName: string, method: string, params?: any[]): Promise<any>;
    getNextNonce(address: string): Promise<number>;
    /**
     * 调用智能合约的方法(constant为true的函数)
     * @param abiStr {string} 合约的abi
     * @param contractAddress {string} 合约地址
     * @param funName {string} 要调用的函数名
     * @param opts
     * @param params
     */
    callContract(abiStr: string, contractAddress: string, funName: string, params?: any[], opts?: {}): Promise<any>;
    getTokenBalance(contractAddress: string, address: string): Promise<string>;
    getBalance(address: string): Promise<string>;
    getTransactionByHash(txHash: string): Promise<{
        blockHash: string;
        blockNumber: number;
        from: string;
        gas: number;
        gasPrice: number;
        hash: string;
        input: string;
        nonce: number;
        r: string;
        s: string;
        to: string;
        transactionIndex: number;
        v: string;
        value: number;
    }>;
    getTransactionReceipt(txHash: string): Promise<{
        blockHash: string;
        blockNumber: number;
        contractAddress: string;
        cumulativeGasUsed: number;
        from: string;
        gasUsed: number;
        logs: {
            address: string;
            blockHash: string;
            blockNumber: string;
            data: string;
            logIndex: string;
            removed: boolean;
            topics: string[];
            transactionHash: string;
            transactionIndex: string;
        }[];
        logsBloom: string;
        status: string;
        to: string;
        transactionHash: string;
        transactionIndex: number;
    }>;
    getTransactionCount(address: string): Promise<number>;
    sendRawTransaction(txHex: string): Promise<string>;
    /**
     * 评估gasprice
     * @param upGasPrice 上限。单位gwei
     * @param downGasPrice 下限。单位gwei
     */
    estimateGasPrice(upGasPrice: string, downGasPrice?: string): Promise<string>;
    getDecimals(contractAddress: any): Promise<number>;
}
