import assert from "assert"
import EthWalletHelper from './wallet'

describe('EthWalletHelper', () => {

  let walletHelper: EthWalletHelper, rpcHelper

  before(async () => {
    walletHelper = new EthWalletHelper()
    // await walletHelper.init("https://mainnet.infura.io/v3/9442f24048d94dbd9a588d3e4e2eac8b")
  })

  it('compileContractForData', async () => {
    try {
      const result = walletHelper.compileContractForData(`
      // SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.7.0;

contract FixedSupplyToken {
    string public  name;

    function hello() public view returns (uint) {
        return 0;
    }
}
      `, "FixedSupplyToken")
      assert.strictEqual(result.metadata.compiler.version, `0.6.12+commit.27d51765`) 
      assert.strictEqual(result.evm.bytecode.object, '608060405234801561001057600080fd5b506101b5806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806306fdde031461003b57806319ff1d21146100be575b600080fd5b6100436100dc565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610083578082015181840152602081019050610068565b50505050905090810190601f1680156100b05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6100c661017a565b6040518082815260200191505060405180910390f35b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156101725780601f1061014757610100808354040283529160200191610172565b820191906000526020600020905b81548152906001019060200180831161015557829003601f168201915b505050505081565b60009056fea264697066735822122025ef4c9208a3aac79d426a3b10ca7d3ae5b20382a01d2d3fdc6b6f38e56c014864736f6c634300060c0033')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encodeToTopicHex', async () => {
    try {
      const result = walletHelper.encodeToTopicHex(`0xd0c0f97199415ab5e27c248613e39807b0f85455`)
      // console.error('result', result)
      assert.strictEqual(result, '0xec6864c83231b2aaf489ac9d92d7a047fa94118cffc1fbdfc802b85d466a077a')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeTxHex', async () => {
    try {
      const result = walletHelper.decodeTxHex(`0xf90100818c84b2d05e00830f42409418177d9743c1dfd9f4b9922986b3d7dbdc6683a680b89a3c5554462d383e2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d20e7be8ee4b8bde79a84e58886e99a94e7aca6202d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a0a090909e998bfe9878c5037e59198e5b7a5e5be97e799bde8a180e79785e8baabe69585efbc8ce7949fe5898de7a79fe4ba86e887aae5a682e794b2e9869be688bf0d0a0a09e4bda0e5a5bd0a09e4bda0e5a4a7e788b70a202020202020202025a03a782c67d135133c9a6bcb48859265a3b40b2b5137108db84421c756e9e89226a06eaa79108826d4229c16e92e45d7240211e0597ad93946a755e70b956c8f5b64`)
      // console.error('result', result)
      assert.strictEqual(result.txId, '0x592b251a0469d65bf591cb4fad53c8d58e4c2b69a01ebd96850a10b787bfe2c0')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getSeedHexByMnemonic', async () => {
    try {
      const result = walletHelper.getSeedHexByMnemonic(`hdghdjsdsfhtr`)
      assert.strictEqual(result, '1d8408003d3ea18e8726af8938a0a404eb4a7e22babe20238697fb828a6b8ffc8d1c495215ad97224323df9d5ccb7153a16309afffde4ee27a8ac6d8edee35d3')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encodeParamsHex', async () => {
    try {
      const result = walletHelper.encodeParamsHex([`address`, `uint256`], ["0xd5bd43c956e9afa3034958b42410c5acfdfaa720", "1000"])
      // console.error('result', result)
      assert.strictEqual(result, '000000000000000000000000d5bd43c956e9afa3034958b42410c5acfdfaa72000000000000000000000000000000000000000000000000000000000000003e8')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encodeParamsHexV2', async () => {
    try {
      const result = walletHelper.encodeParamsHexV2([
        {
          "internalType":"address",
          "name":"",
          "type":"address"
        },
        {
          "internalType":"uint256",
          "name":"",
          "type":"uint256"
        }
      ] as any, ["0xd5bd43c956e9afa3034958b42410c5acfdfaa720", "1000"])
      // console.error('result', result)
      assert.strictEqual(result, '000000000000000000000000d5bd43c956e9afa3034958b42410c5acfdfaa72000000000000000000000000000000000000000000000000000000000000003e8')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeParamsHex', async () => {
    try {

      const input = `0xa9059cbb0000000000000000000000009350284a6dd3f6b7c43ab89ba19d4f31ce22209600000000000000000000000000000000000000000000003a492a7cf981258000`
      // 00000000000000000000000000000000000000000000003a492a7cf981258000
      // console.log(input.substring(input.length - 64, input.length))
      // console.log(walletHelper.decodeParamsHex([`uint256`], input.substring(input.length - 64, input.length))[0].toString(10))


      const result = walletHelper.decodeParamsHex([`address`], `0x000000000000000000000000f7667495cf31925d2607cb69fe2f29eb1a71a81f`)
      // console.error('result', result)
      assert.strictEqual(result[0], 'f7667495cf31925d2607cb69fe2f29eb1a71a81f')

      const result1 = walletHelper.decodeParamsHex([`uint256`], `0x000000000000000000000000000000000000000000000000000000054efc6400`)
      // console.error('result1', result1.toString())
      assert.strictEqual(result1[0].toString(), '22800000000')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeParamsHexV2', async () => {
    try {

      const input = `0000000000000000000000000000000000000000000000000000000000000297000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000888888866c6441627a6e60ca22eded32e7e377d400000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000033636330000000000000000000000000000000000000000000000000000000000`
      const result = walletHelper.decodeParamsHexV2([
        {
          type:"uint256"
        },
        {
          components:[
            {
              type:"address"
            },
            {
              type:"uint256"
            }
          ],
          type: "tuple[]",
        },
        {
          type:"string"
        }
      ] as any, input)
      // console.error('result', result)
      assert.strictEqual(result[0].toString(), "663")
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decryptKeystoreV3', async () => {
    try {
      const result = walletHelper.decryptKeystoreV3(`{"version":3,"id":"7e59dc02-8d42-409d-b29a-a8a0f862cc81","address":"d5bd43c956e9afa3034958b42410c5acfdfaa720","crypto":{"ciphertext":"c38ad947fd9e354fcb9f0d4138120bf66e7f07bba023ea058b394cd99c315486","cipherparams":{"iv":"cecacd85e9cb89788b5aab2f93361233"},"cipher":"aes-128-ctr","kdf":"pbkdf2","kdfparams":{"dklen":32,"salt":"dc9e4a98886738bd8aae134a1f89aaa5a502c3fbd10e336136d4d5fe47448ad6","c":262144,"prf":"hmac-sha256"},"mac":"f6e87c8510b03e18d872ab3fa505f838ffea37df2ff61cc5db7a80138b0c9bea"}}`, 'test')
      // console.error('result', result)
      assert.strictEqual(result, '0x56d7fcd68b219238ce1789f3da653bc9842468b5b63dd8f97a6183e3ced2c67e')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('isAddress', async () => {
    try {
      const bool = walletHelper.isAddress('0x45524f18df7d3f2dea27991545c878fc959bd5b2')
      // console.error(id)
      assert.strictEqual(bool, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getMethodIdV1', async () => {
    try {
      const id = walletHelper.getMethodIdV1('transfer(address,uint256)')
      // console.error(id)
      assert.strictEqual(id, '0xa9059cbb')

      const id1 = walletHelper.getMethodId('transfer', ['address', 'uint256'])
      // console.error(id)
      assert.strictEqual(id1, '0xa9059cbb')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encodePayload', async () => {
    try {
      const id = walletHelper.encodePayload(
        walletHelper.getMethodId(
          'transfer',
          [
            'address',
            'uint256'
          ]
        ),
        [
          'address',
          'uint256'
        ],
        [
          `0x529dab7bad9ef1000c3c0d708878c83fc870f7ae`,
          `1128399999999187146479`
        ],
      )
      // console.error(id)
      assert.strictEqual(id, '0xa9059cbb000000000000000000000000529dab7bad9ef1000c3c0d708878c83fc870f7ae00000000000000000000000000000000000000000000003d2bb21d7ad654d6ef')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('buildMsgTransaction', async () => {
    try {
      const result = walletHelper.buildMsgTx(
        '0xAEE4F8301B87574A197A057C237C0462CB507B5161EB45CD9FC1315C7681EE31',
        `\t\t\t阿里P7员工得白血病身故，生前租了自如甲醛房\r\n
\t你好
\t你大爷
        `,
        140,
        {
          gasPrice: '3000000000',
          gasLimit: 1000000
        }
      )
      // console.error('result', result)
      assert.strictEqual(result['txId'], '0x592b251a0469d65bf591cb4fad53c8d58e4c2b69a01ebd96850a10b787bfe2c0')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('buildTranferTx', async () => {
    try {
      const result = walletHelper.buildTranferTx(
        '0xAEE4F8301B87574A197A057C237C0462CB507B5161EB45CD9FC1315C7681EE31',
        `0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f`,
        `10000000`,
        140,
        {
          gasPrice: '3000000000',
          gasLimit: 1000000
        }
      )
      // console.error('result', result)
      assert.strictEqual(result.chainId, walletHelper.chainId)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('deriveAllByHdPrivKeyPath', async () => {
    try {
      const xpriv = walletHelper.getXprivBySeed('47ce45012752883133bd2a22b2fca73c1780e9ead9c3fe48801832befb75cf5446e3907accf5d3ce3dae0c16172b85030a4bcc8bb7fb69f5820f9682f3be017d')
      const result = walletHelper.deriveAllByXprivPath(xpriv, `m/44'/60'/0'/0/2/22123`)
      // console.error(xpriv, result)
      assert.strictEqual(result['address'], '0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getAddressFromPrivateKey', async () => {
    try {
      const address = walletHelper.getAddressFromPrivateKey('0x492191028c8fd5b4942a4edc004c76dd7427df1a9a33db2632135ab5011ed63b')
      // console.error(address)
      assert.strictEqual(address, '0xc3b6064cb543ef68d0f3314d85f6f89525cedf8f')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodePayload', async () => {
    try {
      const result = walletHelper.decodePayload([
        'address',
        'uint256'
      ], "0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000")
      // console.error(result)
      assert.strictEqual(result['params'][0], '4615927614ab4ca911a12fcd04013e0d2fac4bc6')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodePayload 仅仅methodIdHex', async () => {
    try {
      const result = walletHelper.decodePayload([], "0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000")
      // console.error(result)
      assert.strictEqual(result['methodIdHex'], '0xa9059cbb')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('signMessage', async () => {
    try {
      const result = walletHelper.signMessage('4afc37894e7e4771eba8cb885b654eead3b78651d4db1e6af006d9e11f700f1f', 'hello')
      // console.error('result', result)
      assert.strictEqual(result, '0xf315c40961c73b55f1e4cf4f2665c5cf70fda8f8f3a545e0788fe1f66e21f6d13d49ff33d300b9c5f9f943f095b5fc2838dbbb4d5820bc696fd974d284aa19751c')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('keccak256Hash', async () => {
    try {
      const result = walletHelper.keccak256Hash('test data')
      // console.error('result', result)
      assert.strictEqual(result, '0x7d92c840d5f0ac4f83543201db6005d78414059c778169efa3760f67a451e7ef')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('keccak256HashForEther', async () => {
    try {
      const result = walletHelper.keccak256HashForEther('hello')
      // console.error('result', result)
      assert.strictEqual(result, '0x50b2c43fd39106bafbba0da34fc430e1f91e3c96ea2acee2bc34119f92b37750')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodeSignature', async () => {
    try {
      const result = walletHelper.decodeSignature('02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b')
      // console.error('result', result)
      assert.strictEqual(result.v, '0x1b')
      assert.strictEqual(result.r, '0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a3')
      assert.strictEqual(result.s, '0x1260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b4')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encodeSignature', async () => {
    try {
      const result = walletHelper.encodeSignature({
        v: "0x1b",
        r: "0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a3",
        s: "1260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b4",
      })
      // console.error('result', result)
      assert.strictEqual(result, '0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('recoverSignerAddress', async () => {
    try {
      const result = walletHelper.recoverSignerAddress('f315c40961c73b55f1e4cf4f2665c5cf70fda8f8f3a545e0788fe1f66e21f6d13d49ff33d300b9c5f9f943f095b5fc2838dbbb4d5820bc696fd974d284aa19751c', 'hello')
      // console.error('result', result)
      assert.strictEqual(result.toUpperCase(), '0xC3BF2dF684d91248b01278499184cC30C5bE45C3'.toUpperCase())
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('encryptToKeystoreV3', async () => {
    try {
      const result = walletHelper.encryptToKeystoreV3('test', '0x56d7fcd68b219238ce1789f3da653bc9842468b5b63dd8f97a6183e3ced2c67e')
      // console.error('result', result)
      assert.strictEqual(JSON.parse(result)['address'].toUpperCase(), 'd5bd43c956e9afa3034958b42410c5acfdfaa720'.toUpperCase())
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('maxUint256', async () => {
    try {
      const result = walletHelper.encodeParamsHex(["uint256"], [walletHelper.maxUint256()])
      // console.error('result', result)
      assert.strictEqual(result, 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })
})

