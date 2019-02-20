import 'node-assist'
import assert from "assert"
import BaseEtherLike from './base_ether_like'


describe('BaseEtherLike', () => {

  let walletHelper

  before(async () => {
    walletHelper = new BaseEtherLike()
  })

  it('getXprivBySeed', async () => {
    try {
      const result = walletHelper.getXprivBySeed('47ce45012752883133bd2a22b2fca73c1780e9ead9c3fe48801832befb75cf5446e3907accf5d3ce3dae0c16172b85030a4bcc8bb7fb69f5820f9682f3be017d')
      // logger.error(address)
      assert.strictEqual(result, `xprv9s21ZrQH143K3BeyStPFwm3ctnhGDMLXByJnLQmg4u7GyAqLPCjdJAMPH7WRsfzes477iEsy2JLmUEj3yAfiVsYH6HsWPZxvdqhFHYSnaec`)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getXpubBySeed', async () => {
    try {
      const result = walletHelper.getXpubBySeed('47ce45012752883133bd2a22b2fca73c1780e9ead9c3fe48801832befb75cf5446e3907accf5d3ce3dae0c16172b85030a4bcc8bb7fb69f5820f9682f3be017d')
      // logger.error(result)
      assert.strictEqual(result, `xpub661MyMwAqRbcFfjSYuvGJtzMSpXkcp4NZCEP8oBHdEeFqyAUvk3sqxfs8NoFAPaGH8sio1BGhtb9sTd8jon3un1i4JJPAZbbbMfr6QaW6FJ`)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAddressFromPubKey', async () => {
    try {
      const result = walletHelper.getAddressFromPubKey('0x03091e9d284f9b259d944b4a914d6c1348d76080c9f32ed16db5aaace8fd0e6782')
      // logger.error(result)
      assert.strictEqual(result, `0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f`)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('isValidPublicKey', async () => {
    try {
      const result = walletHelper.isValidPublicKey('0x03091e9d284f9b259d944b4a914d6c1348d76080c9f32ed16db5aaace8fd0e6782')
      // logger.error(result)
      assert.strictEqual(result, true)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('isAddress', async () => {
    try {
      const result = walletHelper.isAddress('0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
      // logger.error(result)
      assert.strictEqual(result, true)
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('deriveAllByXprivPath', async () => {
    try {
      const xpriv = walletHelper.getXprivBySeed('47ce45012752883133bd2a22b2fca73c1780e9ead9c3fe48801832befb75cf5446e3907accf5d3ce3dae0c16172b85030a4bcc8bb7fb69f5820f9682f3be017d')
      const result = walletHelper.deriveAllByXprivPath(xpriv, `m/44'/60'/0'/0/2/22123`)
      // logger.error(result)
      assert.strictEqual(result['address'], '0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  // it('deriveAllByXprivPath', async () => {
  //   try {
  //     const xpriv = walletHelper.getXprivBySeed('47ce45012752883133bd2a22b2fca73c1780e9ead9c3fe48801832befb75cf5446e3907accf5d3ce3dae0c16172b85030a4bcc8bb7fb69f5820f9682f3be017d')
  //     const result = walletHelper.deriveAllByXprivPath(xpriv, `m/44'/60'/0'/0/2/23266`)
  //     logger.error(result)
  //     assert.strictEqual(result['address'], '0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  it('getAddressFromPrivateKey', async () => {
    try {
      const result = walletHelper.getAddressFromPrivateKey('0x492191028c8fd5b4942a4edc004c76dd7427df1a9a33db2632135ab5011ed63b')
      // logger.error(result)
      assert.strictEqual(result, '0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })
})

