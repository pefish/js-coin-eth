import Api from '@parity/api'

export default class Remote {
  timeout: number
  client: Api

  constructor(url: string) {
    let provider = new Api.Provider.Http(url)
    this.client = new Api(provider)
    this.timeout = 10000
  }

  async timeoutFunc(): Promise<void> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), this.timeout)
    )
  }

  async wrapRequest(moduleName: string, method: string, params: any[] = []) {
    return Promise.race([
      this.client[moduleName][method](...params),
      this.timeoutFunc()
    ])
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
    const doFun = async () => {
      const abi = [
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
      ]
      const contract = this.client.newContract(abi, contractAddress)
      return (await contract.instance[`balanceOf`].call({}, [address])).toString(10)
    }

    return Promise.race([
      doFun(),
      this.timeoutFunc()
    ])
  }

  async estimateGasPrice (upGasPrice: string, downGasPrice: string = `2`.shiftedBy_(9)): Promise<string> {
    if (upGasPrice.lt_(downGasPrice)) {
      return downGasPrice
    }
    let gasPrice: string
    let proposeGasPrice = (await this.wrapRequest(`eth`, `gasPrice`)).toString(10).multi_(1.2);
    if (!proposeGasPrice) {
      gasPrice = downGasPrice.add_(upGasPrice).div_(2)
    } else if (proposeGasPrice.lt_(downGasPrice)) {
      gasPrice = downGasPrice
    } else if (proposeGasPrice.gt_(upGasPrice)) {
      gasPrice = upGasPrice;
    } else {
      gasPrice = proposeGasPrice
    }
    return gasPrice.remainDecimal_(0)
  }

  async getDecimals(contractAddress): Promise<number> {
    const doFun = async () => {
      const abi = [
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{ "name": "", "type": "uint8" }],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ]
      const contract = this.client.newContract(abi, contractAddress)
      return (await contract.instance[`decimals`].call({}, [])).toString(10).toNumber_()
    }

    return Promise.race([
      doFun(),
      this.timeoutFunc()
    ])
  }
}
