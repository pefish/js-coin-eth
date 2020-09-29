import '@pefish/js-node-assist'
import assert from "assert"
import Remote from "./remote";
import { StringUtil } from '@pefish/js-node-assist';

declare global {
  namespace NodeJS {
    interface Global {
      logger: any;
    }
  }
}

describe('Remote', () => {

  let helper: Remote

  before(async () => {
    helper = new Remote(`https://mainnet.infura.io/v3/aaa3fc062661462784b334a1a5c51940`)
  })

  it('eth_gasPrice', async () => {
    try {
      const result = await helper.wrapRequest(`eth`, `gasPrice`)
      // console.error('result', result)
      assert.strictEqual(result >= 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getNextNonce', async () => {
    try {
      const result = await helper.getNextNonce("0x8d6AE15f6E3bc537FFD94339d3134Aa13Bb1fB6c")
      // console.error('result', result)
      assert.strictEqual(result >= 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('estimateGasPrice', async () => {
    try {
      const result = await helper.estimateGasPrice(StringUtil.shiftedBy_("1000", 9))
      // console.error('result', result)
      assert.strictEqual(StringUtil.gt_(result, 0), true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionCount', async () => {
    try {
      const result = await helper.client.eth.getTransactionCount('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7')
      // console.error('result', result)
      assert.strictEqual(result >= 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getDecimals', async () => {
    try {
      const result = await helper.getDecimals('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7')
      // console.error('result', result)
      assert.strictEqual(result, 18)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTokenBalance', async () => {
    try {
      const result = await helper.getTokenBalance('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7', `0x529dab7bad9ef1000c3c0d708878c83fc870f7ae`)
      // console.error('result', result)
      assert.strictEqual(StringUtil.gt_(result, 0), true)
    } catch (err) {
      console.error(err)
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
      // console.error('result', result)
      assert.strictEqual(result.toString(10), `18`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })
})

