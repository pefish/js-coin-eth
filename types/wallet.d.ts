import BaseCoin from './base/base_coin';
import Remote, { TransactionInfo } from './remote';
export interface TransactionResult {
    txHex: string;
    txId: string;
    dataFee: string;
    allFee: string;
    nonce: number;
    gasPrice: string;
    gasLimit: number;
    to: string;
    value: string;
    data: string;
    from: string;
    compileVersion?: string;
    abi?: {
        [x: string]: any;
    };
    chainId: number;
}
export interface CompiledContractResult {
    contracts: {
        [filename: string]: {
            [contractName: string]: {
                metadata: string;
                [x: string]: any;
            };
        };
    };
    [x: string]: any;
}
export interface CompiledContractData {
    abi: {
        [x: string]: any;
    }[];
    evm: {
        bytecode: {
            object: any;
        };
        [x: string]: any;
    };
    metadata: {
        compiler: {
            version: string;
        };
        language: string;
        settings: {
            compilationTarget: {
                [fileName: string]: string;
            };
            evmVersion: string;
            optimizer: {
                enable: boolean;
                runs: number;
            };
            libraries: {
                [x: string]: any;
            };
            remappings: any[];
            metadata: {
                bytecodeHash: string;
            };
        };
    };
}
export declare enum ChainIdEnum {
    Mainnet = 1,
    Ropsten = 3,
    Rinkeby = 4,
    Goerli = 5,
    Kovan = 42,
    PrivateChain = 1337
}
/**
 * 以太坊钱包帮助类
 * @extends BaseEtherLike
 */
export default class EthWallet extends BaseCoin {
    remoteClient: Remote;
    chainId: number;
    constructor();
    initRemoteClient(url: string): void;
    setChainId(chainId: number): void;
    zeroAddress(): string;
    compileContract(contractContent: string): CompiledContractResult;
    compileContractForData(contractContent: string, targetContractName: string): CompiledContractData;
    /**
     * 使用私钥签名消息
     * @param privateKey {string} 带0x
     * @param msg
     * @returns {string}
     */
    signMessage(privateKey: string, msg: string): string;
    /**
     * 从签名中得到签名者地址。ECDSA算法中，只能是公约加密私钥解密、私钥签名公钥验证。私钥加密公钥不能解密,只能根据签名结果以及明文得到加密者公钥
     * @param signature {string} 私钥对msg签名后的值，从中可以得到r、s、v
     * @param msg {string} 源消息
     */
    recoverSignerAddress(signature: string, msg: string): string;
    /**
     * 从签名中得到签名者公钥
     * @param signature
     * @param msg
     * @returns {any}
     */
    recoverSignerPublicKey(signature: string, msg: string): string;
    /**
     * 使用公钥加密字符串，只有私钥能解开
     */
    encryptWithPublicKey(publicKey: string, msg: string): Promise<string>;
    decryptWithPrivateKey(privateKey: string, encryptedString: string): Promise<string>;
    /**
     * 解码txHex
     * @param txHex
     */
    decodeTxHex(txHex: string): {
        txId: string;
        nonce: number;
        gasPrice: string;
        gasLimit: number;
        to: string;
        value: string;
        data: string;
        v: string;
        r: string;
        s: string;
        from: string;
        chainId: number;
    };
    encryptToKeystoreV3(pass: string, privateKey: string): string;
    private toV3;
    decryptKeystoreV3(keystoreStr: string, pass: string): string;
    private fromV3;
    /**
     * 构造交易
     * @param privateKey
     * @param toAddress
     * @param amount {string} 单位wei, 十进制
     * @param nonce {number} 十进制。即发送地址已经发送过多少笔交易
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {number}
     * @returns {string}
     */
    buildTranferTx(privateKey: string, toAddress: string, amount: string, nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
    }): TransactionResult;
    /**
     * 构建文本交易
     * @param privateKey
     * @param msg {string} 文本信息
     * @param nonce {number} nonce
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {number}
     */
    buildMsgTx(privateKey: string, msg: string, nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
        value?: string;
    }): TransactionResult;
    /**
     * 构建调用智能合约交易(调用constant为false的函数修改区块链数据)
     * @param privateKey
     * @param contractAddress
     * @param methodName {string} 要调用的方法名
     * @param methodParamTypes {array} ['address', 'number']
     * @param params {array} 如 ['0x00367f9370A71Cf482A64394dFB2367aa3a34339', '100']
     * @param nonce {number} 十进制
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {number}
     */
    buildContractTx(privateKey: string, contractAddress: string, methodName: string, methodParamTypes: string[], params: any[], nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
        value?: string;
    }): TransactionResult;
    /**
     *
     * @param privateKey
     * @param contractAddress
     * @param toAddress
     * @param amount {string} 单位wei, 十进制
     * @param nonce
     */
    buildTokenTransferTx(privateKey: string, contractAddress: string, toAddress: string, amount: string, nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
        value?: string;
    }): TransactionResult;
    /**
     * 构建原生交易，传入data
     * @param data {string} data数据
     * @param privateKey
     * @param nonce {number} 十进制
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {number}
     */
    buildRawTx(data: string, privateKey: string, nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
        value?: string;
    }): TransactionResult;
    /**
     * 获取智能合约方法id
     * @param method {string} 如 transfer(address,uint256)
     * @returns {string}
     */
    getMethodIdV1(method: string): string;
    getMethodId(methodName: string, methodParamTypes: string[]): string;
    /**
     * 解码data数据
     * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
     * @param methodParamTypes {array} ['uint256', 'address']
     */
    decodePayload(payloadTx: string, methodParamTypes: string[]): {
        methodIdHex: string;
        params: any[];
    };
    /**
     * 构建调用智能合约的data数据
     * @param methodIdHex
     * @param methodParamTypes {array} ['number', 'address']
     * @param params {array}
     * @returns {*}
     */
    encodePayload(methodIdHex: string, methodParamTypes: string[], params: any[]): string;
    /**
     * 编码参数成hex，不带0x
     * @param methodParamTypes
     * @param params
     * @returns {*}
     */
    encodeParamsHex(methodParamTypes: string[], params: any[]): string;
    decodeParamsHex(methodParamTypes: string[], paramsHex: string): any[];
    encodeToTopicHex(str: string): string;
    /**
     * 同步性转账
     * @param privateKey
     * @param toAddress
     * @param amount 数量（单位最小）
     * @param nonce
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {number}
     */
    syncTransfer(privateKey: string, toAddress: string, amount: string, nonce: number, opts?: {
        gasPrice?: string;
        gasLimit?: number;
    }): Promise<void>;
    waitConfirm(txHash: string, printLog?: boolean): Promise<TransactionInfo>;
}
