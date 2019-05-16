import 'node-assist'
import assert from "assert"
import Web3Helper from './web3'

declare global {
  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

describe('Web3Helper', () => {

  let walletHelper

  before(async () => {
    walletHelper = new Web3Helper({
      read: 'http://18.179.202.77:8082/del',
      write: 'http://18.179.202.77:8082/del'
    })
  })

  it('getLatestBlockNumber', async () => {
    try {
      const result = await walletHelper.browsers['read'].getLatestBlockNumber()
      global.logger.error(result)
      const result1 = await walletHelper.browsers['write'].getLatestBlockNumber()
      global.logger.error(result1)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

})

