import Api from '@parity/api'
import { StringUtil } from '@pefish/js-node-assist';


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
  client: Api

  constructor(url: string) {
    let provider = new Api.Provider.Http(url)
    this.client = new Api(provider)
    this.timeout = 10000
  }

  async timeoutFunc(): Promise<any> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), this.timeout)
    )
  }

  async wrapRequest(moduleName: string, method: string, params: any[] = []) {
    if (!this.client[moduleName][method]) {
      throw new Error("method not exist")
    }
    return Promise.race([
      this.client[moduleName][method](...params),
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
   * @param opts
   * @param params
   */
  async callContract(abiStr: string, contractAddress: string, funName: string, params = [], opts: {} = {}): Promise<any> {
    const doFun = async () => {
      const abi = JSON.parse(abiStr)
      const contract = this.client.newContract(abi, contractAddress)
      return await contract.instance[funName].call(opts, params)
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
    const result = await this.wrapRequest("eth", "getBalance", [address, "pending"])
    return result.toString(10)
  }

  async getChainId(): Promise<number> {
    const result = await this.wrapRequest("eth", "chainId", [])
    return result.toNumber()
  }

  async getTransactionByHash(txHash: string): Promise<TransactionInfo> {
    const result = await this.wrapRequest("eth", "getTransactionByHash", [txHash])
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
    const result = await this.wrapRequest("eth", "getTransactionReceipt", [txHash])
    return result
  }

  async getTransactionCount(address: string): Promise<number> {
    const result = await this.wrapRequest("eth", "getTransactionCount", [address, "pending"])
    return StringUtil.start(result.toString(10)).toNumber()
  }

  async sendRawTransaction(txHex: string): Promise<string> {
    const result = await this.wrapRequest("eth", "sendRawTransaction", [txHex])
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
    const chainGasPrice: string = (await this.wrapRequest(`eth`, `gasPrice`)).toString(10)
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
