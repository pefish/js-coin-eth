import '@pefish/js-node-assist'
import EthWalletHelper from "../src/wallet";

const walletHelper = new EthWalletHelper()
const xpriv = walletHelper.getXprivBySeed('')
const result = walletHelper.deriveAllByXprivPath(xpriv, ``)
global.logger.error(result)

//
