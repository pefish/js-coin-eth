/** @module */
import 'js-node-assist';
import BaseEtherLike from './base/base_ether_like';
/**
 * 以太坊钱包帮助类
 * @extends BaseEtherLike
 */
declare class EthWalletHelper extends BaseEtherLike {
    constructor();
    /**
     * 获取合约的字节码
     * @param compiledContract
     * @param contractName {string} 要获取哪个合约的字节码
     * @returns {*}
     */
    getBytecodeOfContract(compiledContract: any, contractName: any): string;
    /**
     * 编译合约
     * @param contractStr
     * @param isOptimize
     * @returns {*}
     */
    compileContract(contractStr: any, isOptimize?: number): any;
    /**
     * 使用私钥签名消息
     * @param privateKey {string} 带0x
     * @param msg
     * @returns {string}
     */
    signMessage(privateKey: any, msg: any): any;
    /**
     * 从签名中得到签名者地址。ECDSA算法中，只能是公约加密私钥解密、私钥签名公钥验证。私钥加密公钥不能解密,只能根据签名结果以及明文得到加密者公钥
     * @param signature {string} 私钥对msg签名后的值，从中可以得到r、s、v
     * @param msg {string} 源消息
     * @returns {any}
     */
    recoverSignerAddress(signature: any, msg: any): any;
    /**
     * 从签名中得到签名者公钥
     * @param signature
     * @param msg
     * @returns {any}
     */
    recoverSignerPublicKey(signature: any, msg: any): any;
    /**
     * 使用公钥加密字符串，只有私钥能解开
     * @param publicKey {string} 不带0x
     * @param msg
     * @returns {Promise<Encrypted>}
     */
    encryptWithPublicKey(publicKey: any, msg: any): Promise<any>;
    decryptWithPrivateKey(privateKey: any, encryptedData: any): Promise<any>;
    /**
     * 获取合约的abi
     * @param compiledContract
     * @param contractName {string} 哪个合约
     * @param jsonParse {boolean} 是否需要parse
     * @returns {*}
     */
    getAbiOfContract(compiledContract: any, contractName: any, jsonParse?: boolean): any;
    /**
     * 获取编译器版本
     * @param compiledContract
     * @param contractName
     * @returns {*}
     */
    getCompilerVersionOfContract(compiledContract: any, contractName: any): any;
    /**
     * 解码txHex
     * @param txHex
     * @returns {{nonce: String|*, gasPrice: String|*, gasLimit: String|*, to: *, value: String|*, data: *, v: *, r: string|*, s: string|*, from: *, _chainId: *, _homestead: boolean}}
     */
    decodeTxHex(txHex: any): {
        txId: string;
        nonce: any;
        gasPrice: any;
        gasLimit: any;
        to: any;
        value: any;
        data: any;
        v: any;
        r: any;
        s: any;
        from: any;
        _chainId: any;
        _homestead: any;
    };
    encryptToKeystore(pass: any, privateKey: any): any;
    decryptKeystoreV2(keystoreStr: any, pass: any): any;
    /**
     * 解密keystore文件
     * @param v3Keystore {string}
     * @param password
     * @returns {string}
     */
    decryptKeystore(v3Keystore: any, password: any): string;
    /**
     * 构造交易
     * @param privateKey
     * @param toAddress
     * @param amount {string} 单位wei, 十进制
     * @param nonce {number} 十进制。即发送地址已经发送过多少笔交易
     * @param gasPrice {string} 单位wei, 十进制
     * @param gasLimit {string} 单位wei, 十进制
     * @returns {string}
     */
    buildTransaction(privateKey: string, toAddress: string, amount: string, nonce: number, gasPrice?: string, gasLimit?: string): Promise<any>;
    buildMsgTransaction(privateKey: string, msg: string, nonce: number, gasPrice?: string, gasLimit?: string): Promise<{
        txHex: string;
        txId: string;
        dataFee: any;
        allFee: any;
        nonce: any;
        gasPrice: any;
        gasLimit: any;
        to: any;
        value: any;
        data: any;
        from: any;
    }>;
    /**
     * 构建调用智能合约交易(调用constant为false的函数修改区块链数据)
     * @param privateKey
     * @param contractAddress
     * @param methodName {string} 要调用的方法名
     * @param methodParamTypes {array} ['address', 'number']
     * @param params {array} 如 ['0x00367f9370A71Cf482A64394dFB2367aa3a34339', '100']
     * @param nonce {string} 十进制字符串
     * @param gasPrice
     * @param gasLimit
     * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *}}
     */
    buildContractTransaction(privateKey: any, contractAddress: any, methodName: any, methodParamTypes: any, params: any, nonce?: any, gasPrice?: any, gasLimit?: any): Promise<{
        txHex: string;
        txId: string;
        dataFee: any;
        allFee: any;
        nonce: any;
        gasPrice: any;
        gasLimit: any;
        to: any;
        value: any;
        data: any;
        from: any;
    }>;
    buildContractTxV2(privateKey: any, fromAddress: any, contractAddress: any, methodName: any, methodParamTypes: any, params: any, value?: string, nonce?: any, gasPrice?: any, gasLimit?: any): Promise<{
        txHex: string;
        txId: string;
        dataFee: any;
        allFee: any;
        nonce: any;
        gasPrice: any;
        gasLimit: any;
        to: any;
        value: any;
        data: any;
        from: any;
    }>;
    /**
     * 构建部署智能合约的交易
     * @param compiledContract
     * @param contractName {string} 要发布哪个Contract
     * @param privateKey
     * @param nonce {string} 十进制字符串
     * @param gasPrice
     * @param gasLimit
     * @param constructorArgs {object} {methodParamTypes, params}
     * @returns {{txHex: string, txId: string, dataFee: any|*, allFee: any|*, nonce: number|*, gasPrice: number|*, gasLimit: number|*, to: *, value: number|*, data: *, from: *, compileVersion: *, abi: *}}
     */
    buildDeployContractTx(compiledContract: any, contractName: any, privateKey: any, nonce?: any, gasPrice?: any, gasLimit?: any, constructorArgs?: any): Promise<{
        txHex: string;
        txId: string;
        dataFee: any;
        allFee: any;
        nonce: any;
        gasPrice: any;
        gasLimit: any;
        to: any;
        value: any;
        data: any;
        from: any;
        compileVersion: any;
        abi: any;
    }>;
    /**
     * 获取智能合约方法id
     * @param strToCalc {string} 如 transfer(address,uint256)
     * @returns {string}
     */
    getMethodIdV1(strToCalc: any): any;
    getMethodId(methodName: any, methodParamTypes: any): string;
    /**
     * 解码data数据
     * @param payloadTx {string} 如 0xa9059cbb000000000000000000000000fb7d9853a1d7d96591530ec0a8f66aff35cb1e2100000000000000000000000000000000000000000000000098a7d9b8314c0000
     * @param methodParamTypes {array} ['uint256', 'address']
     */
    decodePayload(payloadTx: any, methodParamTypes: any): {
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
    encodePayload(methodIdHex: any, methodParamTypes: any, params: any): string;
    /**
     * 编码参数成hex，不带0x
     * @param methodParamTypes
     * @param params
     * @returns {*}
     */
    encodeParamsHex(methodParamTypes: any, params: any): string;
    decodeParamsHex(methodParamTypes: any, paramsHex: any): any[];
    encodeToTopicHex(str: any): any;
    /**
     * 调用智能合约的方法(constant为true的函数)
     * @param parityApiClient {object} parity api客户端实例
     * @param abiStr {string} 合约的abi
     * @param contractAddress {string} 合约地址
     * @param funName {string} 要调用的函数名
     * @param opts
     * @param params
     * @returns {Promise<void>}
     */
    callContract(parityApiClient: any, abiStr: any, contractAddress: any, funName: any, opts?: {}, params?: any[]): Promise<any>;
}
export default EthWalletHelper;
