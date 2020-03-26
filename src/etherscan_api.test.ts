import assert from "assert"
import EtherscanApiHelper from './etherscan_api'


declare global {
  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

describe('EtherscanApiHelper', () => {

  let helper

  before(async () => {
    helper = new EtherscanApiHelper('https://api-kovan.etherscan.io/api')
  })

  it('blockNumber', async () => {
    try {
      const result = await helper.blockNumber()
      // assert.strictEqual(result, fixtures['geneSeed']['result']['seed'])
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionCount', async () => {
    try {
      const result = await helper.getTransactionCount('0x444d36fe9474918984e1640a130cc3d13dfa83a6')
      // logger.error(result)
      assert.strictEqual(result > 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBalance', async () => {
    try {
      const result = await helper.getBalance('0x444d36fe9474918984e1640a130cc3d13dfa83a6')
      // logger.error(typeof result)
      assert.strictEqual(typeof result, 'string')
      assert.strictEqual(result > 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })
})

