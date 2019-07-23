import Api from '@parity/api';
export default class Remote {
    client: Api;
    constructor(url: string);
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
    getDecimals(contractAddress: any): Promise<number>;
}
