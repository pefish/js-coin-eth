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
    helper = new Remote(`https://bsc-dataseed.binance.org/`)
  })

  // it('eth_gasPrice', async () => {
  //   try {
  //     const result = await helper.wrapRequest(`eth`, `gasPrice`)
  //     // console.error('result', result)
  //     assert.strictEqual(result >= 0, true)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('getNextNonce', async () => {
  //   try {
  //     const result = await helper.getNextNonce("0x8d6AE15f6E3bc537FFD94339d3134Aa13Bb1fB6c")
  //     // console.error('result', result)
  //     assert.strictEqual(result >= 0, true)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('estimateGasPrice', async () => {
  //   try {
  //     const result = await helper.estimateGasPrice("1000000000000")
  //     // console.error('result', result)
  //     assert.strictEqual(StringUtil.start(result).gt(0), true)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('getDecimals', async () => {
  //   try {
  //     const result = await helper.getDecimals('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7')
  //     // console.error('result', result)
  //     assert.strictEqual(result, 18)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('getTokenBalance', async () => {
  //   try {
  //     const result = await helper.getTokenBalance('0xF631f8186f4fBCb6723Bf5e513db35c45e581aD7', `0x529dab7bad9ef1000c3c0d708878c83fc870f7ae`)
  //     // console.error('result', result)
  //     assert.strictEqual(StringUtil.start(result).gt(0), true)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  // it('getBalance', async () => {
  //   try {
  //     const result = await helper.getBalance(`0x529dab7bad9ef1000c3c0d708878c83fc870f7ae`)
  //     // console.error('result', result)
  //     assert.strictEqual(StringUtil.start(result).gt(0), true)
  //   } catch (err) {
  //     console.error(err)
  //     assert.throws(() => {}, err)
  //   }
  // })

  it('getChainId', async () => {
    try {
      const result = await helper.getChainId()
      // console.error('result', result)
      assert.strictEqual(result, 56)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionByHash', async () => {
    try {
      const result = await helper.getTransactionByHash(`0xaa32869ae57379350ea022bb5cb6fc32bb0d16e3d06e25a7cdbf807f1f9672e1`)
      // console.error('result', result)
      assert.strictEqual(result.hash, "0xaa32869ae57379350ea022bb5cb6fc32bb0d16e3d06e25a7cdbf807f1f9672e1")
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionReceipt', async () => {
    try {
      const result = await helper.getTransactionReceipt(`0xaa32869ae57379350ea022bb5cb6fc32bb0d16e3d06e25a7cdbf807f1f9672e1`)
      // console.error('result.logs', result.logs)
      assert.strictEqual(result.transactionHash, "0xaa32869ae57379350ea022bb5cb6fc32bb0d16e3d06e25a7cdbf807f1f9672e1")
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('getTransactionCount', async () => {
    try {
      const result = await helper.getTransactionCount(`0x49c6aed2E9114667F7897f3f2fDcdDe91c4C5160`)
      // console.error('result', result)
      assert.strictEqual(result > 0, true)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })

  it('sendRawTransaction', async () => {
    try {
      const result = await helper.sendRawTransaction(`0xf909d54a843b9aca00833d09008080b9098360c0604052600660808190527f426953616c65000000000000000000000000000000000000000000000000000060a090815261003e9160039190610145565b506004805460ff19166012179081905560ff16600a0a6005556040805180820190915260038082527f4253450000000000000000000000000000000000000000000000000000000000602090920191825261009b91600691610145565b506040805180820190915260048082527f76302e310000000000000000000000000000000000000000000000000000000060209092019182526100e091600791610145565b506b204fce5e3e250261100000006008553480156100fd57600080fd5b5060085473f075ade7cf89637860005288d60f697026755e7460005260016020527f0ba6d18fa01b9c01844ad14b27322f632d35c18758de66368e121dc052583380556101e0565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061018657805160ff19168380011785556101b3565b828001600101855582156101b3579182015b828111156101b3578251825591602001919060010190610198565b506101bf9291506101c3565b5090565b6101dd91905b808211156101bf57600081556001016101c9565b90565b610794806101ef6000396000f3006080604052600436106100a35763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde0381146100b5578063095ea7b31461013f57806318160ddd1461017757806323b872dd1461019e578063313ce567146101c857806354fd4d50146101f357806370a082311461020857806395d89b4114610229578063a9059cbb1461023e578063dd62ed3e14610262575b3480156100af57600080fd5b50600080fd5b3480156100c157600080fd5b506100ca610289565b6040805160208082528351818301528351919283929083019185019080838360005b838110156101045781810151838201526020016100ec565b50505050905090810190601f1680156101315780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561014b57600080fd5b50610163600160a060020a0360043516602435610317565b604080519115158252519081900360200190f35b34801561018357600080fd5b5061018c610381565b60408051918252519081900360200190f35b3480156101aa57600080fd5b50610163600160a060020a0360043581169060243516604435610387565b3480156101d457600080fd5b506101dd610518565b6040805160ff9092168252519081900360200190f35b3480156101ff57600080fd5b506100ca610521565b34801561021457600080fd5b5061018c600160a060020a036004351661057c565b34801561023557600080fd5b506100ca610597565b34801561024a57600080fd5b50610163600160a060020a03600435166024356105f2565b34801561026e57600080fd5b5061018c600160a060020a0360043581169060243516610707565b6003805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561030f5780601f106102e45761010080835404028352916020019161030f565b820191906000526020600020905b8154815290600101906020018083116102f257829003601f168201915b505050505081565b600160a060020a03338116600081815260026020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a350600192915050565b60085481565b6000600160a060020a038316151561039e57600080fd5b600160a060020a0384166000908152600160205260409020548211156103c357600080fd5b600160a060020a03808516600090815260026020908152604080832033909416835292905220548211156103f657600080fd5b600160a060020a0383166000908152600160205260409020548281011161041c57600080fd5b600160a060020a03831660009081526001602052604090205461043f9083610732565b600160a060020a03808516600090815260016020526040808220939093559086168152205461046e9083610756565b600160a060020a03808616600090815260016020908152604080832094909455600281528382203390931682529190915220546104ab9083610756565b600160a060020a038086166000818152600260209081526040808320338616845282529182902094909455805186815290519287169391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929181900390910190a35060019392505050565b60045460ff1681565b6007805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561030f5780601f106102e45761010080835404028352916020019161030f565b600160a060020a031660009081526001602052604090205490565b6006805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561030f5780601f106102e45761010080835404028352916020019161030f565b6000600160a060020a038316151561060957600080fd5b600160a060020a03331660009081526001602052604090205482111561062e57600080fd5b600160a060020a0383166000908152600160205260409020548281011161065457600080fd5b600160a060020a0333166000908152600160205260409020546106779083610756565b600160a060020a0333811660009081526001602052604080822093909355908516815220546106a69083610732565b600160a060020a038085166000818152600160209081526040918290209490945580518681529051919333909316927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a350600192915050565b600160a060020a03918216600090815260026020908152604080832093909416825291909152205490565b60008282018381108015906107475750828110155b151561074f57fe5b9392505050565b60008282111561076257fe5b509003905600a165627a7a723058203fa9414b85fed048282666d24d663e6c4ced100bbec7eba61c8292eda25b9d0d00291ca090191d3dae579501d29144057f37bfa39bb120efcb4cd2f05c28fb07e8dcc4f1a02c8c12f614bc5760b9065e0dad8caec26cfa0b53d9dc7e81886ac4669b4b9ac3`)
      // console.error('result', result)
      // assert.strictEqual(result > 0, true)
    } catch (err) {
      // console.error(err)
      assert.strictEqual(err.message.indexOf("transaction underpriced") !== -1, true)
    }
  })

  it('callContract', async () => {
    try {
      const result = await helper.callContract(
          `[{"inputs":[{"internalType":"contract TransferProxy","name":"_transferProxy","type":"address"},{"internalType":"contract TransferProxyForDeprecated","name":"_transferProxyForDeprecated","type":"address"},{"internalType":"contract ERC20TransferProxy","name":"_erc20TransferProxy","type":"address"},{"internalType":"contract ExchangeStateV1","name":"_state","type":"address"},{"internalType":"contract ExchangeOrdersHolderV1","name":"_ordersHolder","type":"address"},{"internalType":"address payable","name":"_beneficiary","type":"address"},{"internalType":"address","name":"_buyerFeeSigner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sellToken","type":"address"},{"indexed":true,"internalType":"uint256","name":"sellTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"sellValue","type":"uint256"},{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"buyToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"buyTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"buyValue","type":"uint256"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"salt","type":"uint256"}],"name":"Buy","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sellToken","type":"address"},{"indexed":true,"internalType":"uint256","name":"sellTokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"buyToken","type":"address"},{"indexed":false,"internalType":"uint256","name":"buyTokenId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"salt","type":"uint256"}],"name":"Cancel","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"internalType":"address payable","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"buyerFeeSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"salt","type":"uint256"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"sellAsset","type":"tuple"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"buyAsset","type":"tuple"}],"internalType":"struct ExchangeDomainV1.OrderKey","name":"key","type":"tuple"}],"name":"cancel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"erc20TransferProxy","outputs":[{"internalType":"contract ERC20TransferProxy","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"salt","type":"uint256"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"sellAsset","type":"tuple"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"buyAsset","type":"tuple"}],"internalType":"struct ExchangeDomainV1.OrderKey","name":"key","type":"tuple"},{"internalType":"uint256","name":"selling","type":"uint256"},{"internalType":"uint256","name":"buying","type":"uint256"},{"internalType":"uint256","name":"sellerFee","type":"uint256"}],"internalType":"struct ExchangeDomainV1.Order","name":"order","type":"tuple"},{"components":[{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"internalType":"struct ExchangeDomainV1.Sig","name":"sig","type":"tuple"},{"internalType":"uint256","name":"buyerFee","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"buyer","type":"address"}],"name":"exchange","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ordersHolder","outputs":[{"internalType":"contract ExchangeOrdersHolderV1","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"components":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"salt","type":"uint256"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"sellAsset","type":"tuple"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"buyAsset","type":"tuple"}],"internalType":"struct ExchangeDomainV1.OrderKey","name":"key","type":"tuple"},{"internalType":"uint256","name":"selling","type":"uint256"},{"internalType":"uint256","name":"buying","type":"uint256"},{"internalType":"uint256","name":"sellerFee","type":"uint256"}],"internalType":"struct ExchangeDomainV1.Order","name":"order","type":"tuple"},{"internalType":"uint256","name":"fee","type":"uint256"}],"name":"prepareBuyerFeeMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"components":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"salt","type":"uint256"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"sellAsset","type":"tuple"},{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"enum ExchangeDomainV1.AssetType","name":"assetType","type":"uint8"}],"internalType":"struct ExchangeDomainV1.Asset","name":"buyAsset","type":"tuple"}],"internalType":"struct ExchangeDomainV1.OrderKey","name":"key","type":"tuple"},{"internalType":"uint256","name":"selling","type":"uint256"},{"internalType":"uint256","name":"buying","type":"uint256"},{"internalType":"uint256","name":"sellerFee","type":"uint256"}],"internalType":"struct ExchangeDomainV1.Order","name":"order","type":"tuple"}],"name":"prepareMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address payable","name":"newBeneficiary","type":"address"}],"name":"setBeneficiary","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newBuyerFeeSigner","type":"address"}],"name":"setBuyerFeeSigner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"state","outputs":[{"internalType":"contract ExchangeStateV1","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"transferProxy","outputs":[{"internalType":"contract TransferProxy","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"transferProxyForDeprecated","outputs":[{"internalType":"contract TransferProxyForDeprecated","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]`,
          `0x265567f7306516F4133060F723B5eAf1eF12A33f`,
          `prepareMessage`,
          [
            [
              [
                '0x888888866c6441627A6e60cA22EDEd32E7e377D4',  // 订单的创建者
                "6689337262877936827368368897105045076608255427359203888227152392",
                [
                  '0x3e855B7941fE8ef5F07DAd68C5140D6a3EC1b286',
                  663,
                  3
                ],
                [
                  '0x0000000000000000000000000000000000000000',
                  0,
                  0
                ]
              ],
              1,
              "10000000000000000",
              250
            ]
          ],
      )
      // console.error('result', result)
      assert.strictEqual(result, `863e5a605c76c95d16109a81d4649d86c07ed31c4458a455e371fdf942203743`)
    } catch (err) {
      console.error(err)
      assert.throws(() => {}, err)
    }
  })
})

