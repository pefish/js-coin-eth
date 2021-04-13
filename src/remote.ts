import { StringUtil } from '@pefish/js-node-assist';
import * as ethers from "ethers"

export interface TransactionInfo {
  blockHash: string,
  blockNumber: number,
  from: string,
  gas: number,
  gasPrice: number,
  hash: string,
  input: string,
  nonce: number,
  r: string,
  s: string,
  to: string,
  transactionIndex: number,
  v: string,
  value: number
}
export default class Remote {
  timeout: number
  provider: ethers.providers.JsonRpcProvider

  constructor(url: string) {
    this.provider = new ethers.providers.JsonRpcProvider(url)
    this.timeout = 10000
  }

  async timeoutFunc(): Promise<any> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), this.timeout)
    )
  }

  async wrapRequest(method: string, params: any[] = []) {
    return Promise.race([
      this.provider.send(method, params),
      this.timeoutFunc()
    ])
  }

  async getNextNonce(address: string): Promise<number> {
    return await this.getTransactionCount(address)
  }

  /**
   * 调用智能合约的方法(constant为true的函数)
   * @param abiStr {string} 合约的abi
   * @param contractAddress {string} 合约地址
   * @param funName {string} 要调用的函数名
   * @param params
   */
  async callContract(abiStr: string, contractAddress: string, funName: string, params = []): Promise<any> {
    const doFun = async () => {
      const contract = new ethers.Contract(contractAddress, abiStr, this.provider);
      return await contract[funName](...params)
    }

    return Promise.race([
      doFun(),
      this.timeoutFunc()
    ])
  }

  async getTokenBalance(contractAddress: string, address: string): Promise<string> {
    const result = await this.callContract(JSON.stringify([
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]), contractAddress, "balanceOf", [address])
    return result.toString(10)
  }

  async getBalance(address: string): Promise<string> {
    const result = await this.wrapRequest("eth_getBalance", [address, "pending"])
    return result.toString(10)
  }

  async getChainId(): Promise<number> {
    const result = await this.wrapRequest("eth_chainId", [])
    return StringUtil.start(result).toNumber()
  }

  async getTransactionByHash(txHash: string): Promise<TransactionInfo> {
    const result = await this.wrapRequest("eth_getTransactionByHash", [txHash])
    return result
  }

  async getTransactionReceipt(txHash: string): Promise<{
    blockHash: string,
    blockNumber: number,
    contractAddress: string,
    cumulativeGasUsed: number,
    from: string,
    gasUsed: number,
    logs: {
      address: string,
      blockHash: string,
      blockNumber: string,
      data: string,
      logIndex: string,
      removed: boolean,
      topics: string[],
      transactionHash: string,
      transactionIndex: string
    }[],
    logsBloom: string,
    status: string,
    to: string,
    transactionHash: string,
    transactionIndex: number
  }> {
    const result = await this.wrapRequest("eth_getTransactionReceipt", [txHash])
    return result
  }

  async getTransactionCount(address: string): Promise<number> {
    const result = await this.wrapRequest("eth_getTransactionCount", [address, "pending"])
    return StringUtil.start(result.toString(10)).toNumber()
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const result = await this.wrapRequest("eth_sendRawTransaction", [txHex])
    return result
  }

  /**
   * 评估gasprice
   * @param upGasPrice 上限。单位gwei
   * @param downGasPrice 下限。单位gwei
   */
  async estimateGasPrice(upGasPrice: string, downGasPrice: string = "2000000000"): Promise<string> {
    if (StringUtil.start(upGasPrice).lt(downGasPrice)) {
      return downGasPrice
    }
    let gasPrice: string
    const chainGasPrice: string = (await this.wrapRequest(`eth_gasPrice`)).toString(10)
    let proposeGasPrice = StringUtil.start(chainGasPrice).multi(1.2).end();
    if (!proposeGasPrice) {
      gasPrice = StringUtil.start(downGasPrice).add(upGasPrice).div(2).end()
    } else if (StringUtil.start(proposeGasPrice).lt(downGasPrice)) {
      gasPrice = downGasPrice
    } else if (StringUtil.start(proposeGasPrice).gt(upGasPrice)) {
      gasPrice = upGasPrice;
    } else {
      gasPrice = proposeGasPrice
    }
    return StringUtil.start(gasPrice).remainDecimal(0).end()
  }

  async getDecimals(contractAddress): Promise<number> {
    const result = await this.callContract(JSON.stringify([
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ]), contractAddress, "decimals", [])
    return StringUtil.start(result.toString(10)).toNumber()
  }
}
