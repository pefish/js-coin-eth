import 'node-assist'
import assert from "assert"
import RskRpc from './rsk_rpc'

describe('ParityRpcUtil', () => {

  let helper

  before(async () => {
    // https://mainnet.infura.io/v3/1ced8c7399764a11bcaed018f1e26b13
    helper = new RskRpc("https://public-node.rsk.co").getClient()
  })

  it('blockNumber', async () => {
    try {
      const result = await helper.eth.blockNumber()
      logger.error(result)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  // it('getBlockByNumber', async () => {
  //   try {
  //     const result = await helper.eth.getBlockByNumber('latest')
  //     logger.error(result)
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

})

