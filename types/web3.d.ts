import BaseCoin from "./base/base_coin";
export declare class Browser extends BaseCoin {
    contracts: object;
    eth: any;
    constructor(web3: any);
    setContract(name: any, abi: any, address: any): void;
    callContract(contractName: any, methedName: any, params?: any[]): Promise<any>;
    getBalance(address: any): Promise<any>;
    listenAllEvent(contractName: any, opts: any, cb: any): void;
    getPastEvents(contractName: any, opts: any, eventName?: string): Promise<any>;
    getLatestBlockNumber(): Promise<any>;
    getTransactionCount(address: any): Promise<any>;
    sendRawTransaction(hex: any): Promise<any>;
    getConfirmations(txId: any): Promise<any>;
}
export default class Web3Helper extends Browser {
    browsers: object;
    constructor(providers?: {});
    setBrowser(name: any, provider: any): void;
    static parseStructResult(result: any): {};
    static getMethodId(methodName: any, methodParamTypes: any): string;
    static encodePayload(methodName: any, methodParamTypes: any, params: any): string;
}
