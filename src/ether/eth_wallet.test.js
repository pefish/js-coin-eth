import 'node-assist'
import assert from "assert"
import EthWalletHelper from './eth_wallet'


describe('EthWalletHelper', () => {

  let walletHelper
  const testnet = 'testnet', mainnet = 'mainnet'

  before(async () => {
    walletHelper = new EthWalletHelper()
  })

//   it('decryptKeystore', async () => {
//     try {
//       const result = walletHelper.decryptKeystore(`{"address":"d5bd43c956e9afa3034958b42410c5acfdfaa720","crypto":{"cipher":"aes-128-ctr","ciphertext":"ac7f7e4a2f245d7dcef83e67a7b59d357695c51601e29a0e487a172e07081084","cipherparams":{"iv":"f70f5e51d606b9caebe15bd014c3bcdd"},"mac":"87dc9cb389e546a2e444d5f164ae15e16dcf2c3d67b3cd1ce07e0a7f70a07db7","kdf":"pbkdf2","kdfparams":{"c":262144,"dklen":32,"prf":"hmac-sha256","salt":"063419904460b0ecfa708c3050167d1060617769cb8fecc2bc3e8be71ddf1ae6"}},"id":"aac22315-85e3-42b9-9c0c-c3e278e7ffb7","version":3}`, 'test')
//       // logger.error('result', result)
//       assert.strictEqual(result, '0x56d7fcd68b219238ce1789f3da653bc9842468b5b63dd8f97a6183e3ced2c67e')
//     } catch (err) {
//       logger.error(err)
//       assert.throws(() => {}, err)
//     }
//   })
//
//   it('isAddress', async () => {
//     try {
//       const bool = walletHelper.isAddress('0x45524f18df7d3f2dea27991545c878fc959bd5b2')
//       // logger.error(id)
//       assert.strictEqual(bool, true)
//     } catch (err) {
//       logger.error(err)
//       assert.throws(() => {}, err)
//     }
//   })
//
//   it('getMethodIdV1', async () => {
//     try {
//       const id = walletHelper.getMethodIdV1('transfer(address,uint256)')
//       // logger.error(id)
//       assert.strictEqual(id, '0xa9059cbb')
//     } catch (err) {
//       logger.error(err)
//       assert.throws(() => {}, err)
//     }
//   })
//
//   it('buildMsgTransaction', async () => {
//     try {
//       const result = await walletHelper.buildMsgTransaction(
//         '0xAEE4F8301B87574A197A057C237C0462CB507B5161EB45CD9FC1315C7681EE31',
//         `\t\t\t阿里P7员工得白血病身故，生前租了自如甲醛房\r\n
// \t爱人姓王，一家一直住在北京。今年，王同学拿到了阿里巴巴offer，职位是“交互设计专家”，级别P7。对于37岁的王同学来说，前景看好，试问，如今还有多少比BAT更好的互联网工作呢？于是，他只身一人，离京赴杭州阿里巴巴总部入职。按照阿里惯例，得了一个花名：安时，工号165243。
// \t一切都很顺利，包括租了一个自如的房间。房子本来是复式，自如将其改造了，二层可以独立使用，里面包括客厅、卧室、储藏间、卫生间。家具也都是自如配置的。王同学就住在这里。
// \t到了7月，他和妻子说，很不舒服。随后回京，在301医院等医院检查，发现血小板减少；随后，在首都医科大学附属北京朝阳医院，确诊为急性髓系白血病；7月13日，病情恶化，去世。
// \t王同学今年1月做了全面体检，以便入职阿里巴巴。体检报告显示，各项身体指标正常，包括血常规，各项数值均在参考范围内。这个病从哪里来呢？在医院，隔壁床的病人得了完全一样的病，一问，说估计是房间刚刚装修导致。王同学在北京的房屋已居住了十几年，工作的阿里巴巴滨江园区办公楼也已使用十几年，可以排除，他病逝后，妻子来到杭州，对那套自如房子进行了检测。结果显示：甲醛超标。妻子说，丈夫在杭州的时候，大多数时间都是夏天，正热，开着空调，恐怕也很难做到敞开通风。
// \t王同学去世后，留下一个女儿，刚刚三周岁。王同学的爱人，向法院提交了起诉书。然后，他们接到了什么呢？接到了自如公司的短信，发到已去世的王同学手机：“诉讼书表明您已经没有继续履约的能力，现解除合同。”
// \t“没有对空气污染做任何说明，而且，我们已经付过房租，仍然有房屋的使用权。”她很生气：“然后就接到自如的电话，表示就在房间外面，要收房。他们还是进去了。”
// \t故事到这里，我也写不下去了。
// \t这个故事，没有人性。好冷血。
// \t请注意，以上，都是最近发生的事情。在我上一篇文章发出后，自如公司的公关人员和我进行了沟通，“我们很重视，感谢监督指正”“健康是非常重要的问题”云云。但是，随后就投诉呦呦鹿鸣侵权，按照微信规则，要么我承认侵权，可以减半处罚；要么不承认侵权，侵权如成立则要把呦呦鹿鸣封号。
// \t回头看王同学这个案子，原告会胜诉吗？我很不乐观。2016年，北京有一位自如租客，妻子怀孕住进去的，胎儿6个月时得了白血病，不得不引产，而房屋检测显示甲醛污染严重。他起诉了。法院委托两家司法鉴定机构进行鉴定，但都说“超出鉴定技术能力”，拒绝了委托。随后，一审法院说：现有证据未能证明该种情形下与白血病的发病存在关系，赔偿请求于法无据，不予支持。
// \t报道这个案子最详细的，是《北京晨报》，但是，这家报社在这个月，关门了。这当然是一个巧合，但，世间所有的巧合，都有极大的信息量可供解读。我只希望，呦呦鹿鸣的命运，不是北京晨报的命运。
//         `,
//         '140',
//         '3000000000',
//         '1000000'
//       )
//       // logger.error('result', result)
//       assert.strictEqual(result['txId'], '0xc887516c6b2ad1c04a647abfe2b7d7c13ee8a087d91f2c6517c5eb388ad5cc31')
//     } catch (err) {
//       logger.error(err)
//       assert.throws(() => {}, err)
//     }
//   })
//
//   it('geneAddress', async () => {
//     try {
//       const hdPrivKey = walletHelper.getHdPrivKeyBySeed('da2a48a1b9fbade07552281143814b3cd7ba4b53a7de5241439417b9bb540e229c45a30b0ce32174aaccc80072df7cbdff24f0c0ae327cd5170d1f276b890173', testnet)
//       const result = walletHelper.deriveAllByHdPrivKeyIndex(hdPrivKey, 1)
//       // logger.error(hdPrivKey, result)
//       assert.strictEqual(result['address'], '0x444d36fe9474918984e1640a130cc3d13dfa83a6')
//     } catch (err) {
//       logger.error(err)
//       assert.throws(() => {}, err)
//     }
//   })

  it('getAddressFromPrivateKey', async () => {
    try {
      const address = walletHelper.getAddressFromPrivateKey('0x1d0ed3a952b7573d46f0d2a3dbe1ae71333f86241f8e5d367ccb56986dfd1de7')
      logger.error(address)
      // assert.strictEqual(address, '0x7fe19dddfe7cd3e0399fc6644bdf76b5fb7a282d')
    } catch (err) {
      logger.error(err)
      assert.throws(() => {}, err)
    }
  })

  // it('decodePayload', async () => {
  //   try {
  //     const result = walletHelper.decodePayload('0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000', [
  //       'address',
  //       'uint256'
  //     ])
  //     // logger.error(result)
  //     assert.strictEqual(result['params'][0], '4615927614ab4ca911a12fcd04013e0d2fac4bc6')
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('decodePayload 仅仅methodIdHex', async () => {
  //   try {
  //     const result = walletHelper.decodePayload('0xa9059cbb0000000000000000000000004615927614ab4ca911a12fcd04013e0d2fac4bc6000000000000000000000000000000000000000000000000a688906bd8b00000', [])
  //     // logger.error(result)
  //     assert.strictEqual(result['methodIdHex'], '0xa9059cbb')
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // // it('callContract balanceOf', async () => {
  // //   try {
  // //     let provider = new Api.Provider.Http('http://10.1.0.152:8545')
  // //     const parityApi = new Api(provider)
  // //     const balance = await walletHelper.callContract(
  // //       parityApi,
  // //       '[{"constant":false,"inputs":[{"name":"_durationOfLock","type":"uint256"}],"name":"setDurationOfLock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"disableSetTransferable","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_addresses","type":"address[]"},{"name":"_amounts","type":"uint256[]"}],"name":"transferForMultiAddresses","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deployBlockNumber","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TIMETHRESHOLD","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approveMintTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_aelfDevMultisig","type":"address"}],"name":"setAElfDevMultisig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"aelfDevMultisig","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"durationOfLock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mintTokensWithinTime","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"burnTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_aelfCommunityMultisig","type":"address"}],"name":"setAElfCommunityMultisig","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"transferable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"getLockTokens","outputs":[{"name":"value","type":"uint256"},{"name":"blockNumber","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_transferable","type":"bool"}],"name":"setTransferable","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"withdrawMintTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupplyCap","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"mintTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"canSetTransferable","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"aelfCommunityMultisig","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINTTIME","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_caller","type":"address"}],"name":"SetDurationOfLock","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"ApproveMintTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"WithdrawMintTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"MintTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"BurnTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_caller","type":"address"}],"name":"MintFinished","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_address","type":"address"},{"indexed":false,"name":"_transferable","type":"bool"}],"name":"SetTransferable","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_old","type":"address"},{"indexed":true,"name":"_new","type":"address"}],"name":"SetAElfDevMultisig","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_old","type":"address"},{"indexed":true,"name":"_new","type":"address"}],"name":"SetAElfCommunityMultisig","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_address","type":"address"},{"indexed":false,"name":"_canSetTransferable","type":"bool"}],"name":"DisableSetTransferable","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]\n',
  // //       '0x2e3A7512B43B70f1EF633a7d6E711EA2a84ca205',
  // //       'balanceOf',
  // //       {},
  // //       ['0xf283905f72a2133b10e1cc0e5f364b21cd6e3f44']
  // //     )
  // //     logger.error('balance', balance)
  // //   } catch (err) {
  // //     logger.error(err)
  // //     assert.throws(() => {}, err)
  // //   }
  // // })
  //
  // it('signMessage', async () => {
  //   try {
  //     const result = walletHelper.signMessage('0xc752dd09198bd21fe41e953c79e2c6667f68eb8d89a22a93d6843dbe39a42c25', 'test data')
  //     // logger.error('result', result)
  //     assert.strictEqual(result, '0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b')
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('recoverSignerAddress', async () => {
  //   try {
  //     const result = walletHelper.recoverSignerAddress('0x02852445ee888efc18cdfd36d4d284048d8d70d131225e2fc3f36594a75275a31260c568456138aae5939a12d789da3f5e6bb9c93fbfe41d36468965fa8769b41b', 'test data')
  //     // logger.error('result', result)
  //     assert.strictEqual(result.toUpperCase(), '0x50934521b4b6bf6d823beae47da8955156698456'.toUpperCase())
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('encryptToKeystore', async () => {
  //   try {
  //     const result = walletHelper.encryptToKeystore('test', '0x56d7fcd68b219238ce1789f3da653bc9842468b5b63dd8f97a6183e3ced2c67e')
  //     // logger.error('result', JSON.stringify(result))
  //     assert.strictEqual(result['address'].toUpperCase(), 'd5bd43c956e9afa3034958b42410c5acfdfaa720'.toUpperCase())
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })
  //
  // it('decryptKeystoreV2', async () => {
  //   try {
  //     const result = walletHelper.decryptKeystoreV2('{"address":"d5bd43c956e9afa3034958b42410c5acfdfaa720","crypto":{"cipher":"aes-128-ctr","ciphertext":"ac7f7e4a2f245d7dcef83e67a7b59d357695c51601e29a0e487a172e07081084","cipherparams":{"iv":"f70f5e51d606b9caebe15bd014c3bcdd"},"mac":"87dc9cb389e546a2e444d5f164ae15e16dcf2c3d67b3cd1ce07e0a7f70a07db7","kdf":"pbkdf2","kdfparams":{"c":262144,"dklen":32,"prf":"hmac-sha256","salt":"063419904460b0ecfa708c3050167d1060617769cb8fecc2bc3e8be71ddf1ae6"}},"id":"aac22315-85e3-42b9-9c0c-c3e278e7ffb7","version":3}', 'test')
  //     // logger.error('result', result)
  //     assert.strictEqual(result, '0x56d7fcd68b219238ce1789f3da653bc9842468b5b63dd8f97a6183e3ced2c67e')
  //   } catch (err) {
  //     logger.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

})

