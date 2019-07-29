import '@pefish/js-node-assist'
import assert from "assert"
import Remote from "./remote";

declare global {
  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

describe('Remote', () => {

  let helper

  before(async () => {
    helper = new Remote(`https://mainnet.infura.io/v3/aaa3fc062661462784b334a1a5c51940`)
  })

  it('getTransactionCount', async () => {
    try {
      const result = await helper.client.eth.getTransactionCount('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7')
      // global.logger.error('result', result)
      assert.strictEqual(result >= 0, true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getDecimals', async () => {
    try {
      const result = await helper.getDecimals('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7')
      // global.logger.error('result', result)
      assert.strictEqual(result, 18)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTokenBalance', async () => {
    try {
      const result = await helper.getTokenBalance('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7', `0x529dab7bad9ef1000c3c0d708878c83fc870f7ae`)
      // global.logger.error('result', result)
      assert.strictEqual(result.gt_(0), true)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('callContract', async () => {
    try {
      const result = await helper.callContract(JSON.stringify([
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{"name": "", "type": "uint8"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ]), `0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7`, `decimals`)
      // global.logger.error('result', result)
      assert.strictEqual(result.toString(10), `18`)
    } catch (err) {
      global.logger.error(err)
      assert.throws(() => {}, err)
    }
  })
})

