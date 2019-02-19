import 'node-assist'
import assert from "assert"
import Web3Helper from './web3'

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
      logger.error(result)
      const result1 = await walletHelper.browsers['write'].getLatestBlockNumber()
      logger.error(result1)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

})

