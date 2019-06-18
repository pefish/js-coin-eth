import 'node-assist'
import assert from "assert"
import ParityRpcUtil from './parity_rpc'

declare global {
  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

describe('ParityRpcUtil', () => {

  let helper

  before(async () => {
    // https://mainnet.infura.io/v3/1ced8c7399764a11bcaed018f1e26b13
    helper = ParityRpcUtil.getParityApiHelper({
      protocol: 'https',
      host: 'mainnet.infura.io',
      path: '/v3/1ced8c7399764a11bcaed018f1e26b13'
    })
  })

  it('blockNumber', async () => {
    try {
      const result = await helper.eth.blockNumber()
      global.logger.error(result)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getBlockByNumber', async () => {
    try {
      const result = await helper.eth.getBlockByNumber('latest')
      global.logger.error(result)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

})
