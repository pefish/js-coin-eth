/**
 * parity rpc调用工具
 */
export default class ParityRpc {
    /**
     * 获取parity api调用器
     * @param url
     * @param type {number} 1 节点提供的rpc  2 etherscan提供的api接口
     */
    static getParityApiHelper(url?: string | object, type?: number): any;
}
