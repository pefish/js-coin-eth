import 'node-assist'
import assert from "assert"
import BaseEtherLike from './base_ether_like'


describe('BaseEtherLike', () => {

  let walletHelper

  before(async () => {
    walletHelper = new BaseEtherLike()
  })

  it('getHdPrivKeyBySeed', async () => {
    try {
      const hdPrivKey = walletHelper.getHdPrivKeyBySeed('da2a48a1b9fbade07552281143814b3cd7ba4b53a7de5241439417b9bb540e229c45a30b0ce32174aaccc80072df7cbdff24f0c0ae327cd5170d1f276b890173')
      const result = walletHelper.deriveAllByHdPrivKeyIndex(hdPrivKey, 1)
      // logger.error(hdPrivKey, result)
      assert.strictEqual(result['address'], '0x444d36fe9474918984e1640a130cc3d13dfa83a6')
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAddressFromPrivateKey', async () => {
    try {
      const result = walletHelper.getAddressFromPrivateKey('0x1d3bd73535194e4695903da1d761c115f17e85aaf89bdb2c068eccd6ee1bed28')
      // logger.error(result)
      assert.strictEqual(result, '0x444d36fe9474918984e1640a130cc3d13dfa83a6')
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })
})

