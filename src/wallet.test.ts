import assert from "assert"
import EthWalletHelper from './wallet'


describe('EthWalletHelper', () => {

  let walletHelper: EthWalletHelper, rpcHelper

  before(async () => {
    walletHelper = new EthWalletHelper()
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
      const result = walletHelper.decodeTxHex(`0xf86c028505d21dba0083419ce09490a7c100264a6ef684abdcdef7d7f67e54b9110887038d7ea4c680008026a001671820578358c87a7f768ee248353c2335a483129bef6970a3b4b15a3c98f9a0582b62a182f0749ea9f863098d012c01db3e1cc90e16d3e68e74af84961d9112`)
      // console.error('result', result)
      assert.strictEqual(result.txId, '0xe09ba868a4ceccf3840c0ce46014ced470d4fd98cfa7a1f607e76495d41977e6')
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
\t爱人姓王，一家一直住在北京。今年，王同学拿到了阿里巴巴offer，职位是“交互设计专家”，级别P7。对于37岁的王同学来说，前景看好，试问，如今还有多少比BAT更好的互联网工作呢？于是，他只身一人，离京赴杭州阿里巴巴总部入职。按照阿里惯例，得了一个花名：安时，工号165243。
\t一切都很顺利，包括租了一个自如的房间。房子本来是复式，自如将其改造了，二层可以独立使用，里面包括客厅、卧室、储藏间、卫生间。家具也都是自如配置的。王同学就住在这里。
\t到了7月，他和妻子说，很不舒服。随后回京，在301医院等医院检查，发现血小板减少；随后，在首都医科大学附属北京朝阳医院，确诊为急性髓系白血病；7月13日，病情恶化，去世。
\t王同学今年1月做了全面体检，以便入职阿里巴巴。体检报告显示，各项身体指标正常，包括血常规，各项数值均在参考范围内。这个病从哪里来呢？在医院，隔壁床的病人得了完全一样的病，一问，说估计是房间刚刚装修导致。王同学在北京的房屋已居住了十几年，工作的阿里巴巴滨江园区办公楼也已使用十几年，可以排除，他病逝后，妻子来到杭州，对那套自如房子进行了检测。结果显示：甲醛超标。妻子说，丈夫在杭州的时候，大多数时间都是夏天，正热，开着空调，恐怕也很难做到敞开通风。
\t王同学去世后，留下一个女儿，刚刚三周岁。王同学的爱人，向法院提交了起诉书。然后，他们接到了什么呢？接到了自如公司的短信，发到已去世的王同学手机：“诉讼书表明您已经没有继续履约的能力，现解除合同。”
\t“没有对空气污染做任何说明，而且，我们已经付过房租，仍然有房屋的使用权。”她很生气：“然后就接到自如的电话，表示就在房间外面，要收房。他们还是进去了。”
\t故事到这里，我也写不下去了。
\t这个故事，没有人性。好冷血。
\t请注意，以上，都是最近发生的事情。在我上一篇文章发出后，自如公司的公关人员和我进行了沟通，“我们很重视，感谢监督指正”“健康是非常重要的问题”云云。但是，随后就投诉呦呦鹿鸣侵权，按照微信规则，要么我承认侵权，可以减半处罚；要么不承认侵权，侵权如成立则要把呦呦鹿鸣封号。
\t回头看王同学这个案子，原告会胜诉吗？我很不乐观。2016年，北京有一位自如租客，妻子怀孕住进去的，胎儿6个月时得了白血病，不得不引产，而房屋检测显示甲醛污染严重。他起诉了。法院委托两家司法鉴定机构进行鉴定，但都说“超出鉴定技术能力”，拒绝了委托。随后，一审法院说：现有证据未能证明该种情形下与白血病的发病存在关系，赔偿请求于法无据，不予支持。
\t报道这个案子最详细的，是《北京晨报》，但是，这家报社在这个月，关门了。这当然是一个巧合，但，世间所有的巧合，都有极大的信息量可供解读。我只希望，呦呦鹿鸣的命运，不是北京晨报的命运。
        `,
        140,
        {
          gasPrice: '3000000000',
          gasLimit: 1000000
        }
      )
      // console.error('result', result)
      assert.strictEqual(result['txId'], '0x82fa95bcc9b12d53eef8f065a6124940e6290f208957dab0e76d4a21790d61f6')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('buildTranferTx', async () => {
    try {
      walletHelper.setChainId(99)
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
      assert.strictEqual(result.chainId, 99)
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
      const result = walletHelper.decodePayload('0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000', [
        'address',
        'uint256'
      ])
      // console.error(result)
      assert.strictEqual(result['params'][0], '4615927614ab4ca911a12fcd04013e0d2fac4bc6')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('decodePayload 仅仅methodIdHex', async () => {
    try {
      const result = walletHelper.decodePayload('0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000', [])
      // console.error(result)
      assert.strictEqual(result['methodIdHex'], '0xa9059cbb')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('signMessage', async () => {
    try {
      const result = walletHelper.signMessage('0xc752dd09198bd21fe41e953c79e2c6667f68eb8d89a22a93d6843dbe39a42c25', 'test data')
      // console.error('result', result)
      assert.strictEqual(result, '0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b')
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('recoverSignerAddress', async () => {
    try {
      const result = walletHelper.recoverSignerAddress('0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b', 'test data')
      // console.error('result', result)
      assert.strictEqual(result.toUpperCase(), '0x50934521b4b6bf6d823beae47da8955156698456'.toUpperCase())
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
})

