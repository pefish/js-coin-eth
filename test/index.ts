import Remote from "../src/remote";
import Starter from '@pefish/js-util-starter'
import Timer from '@pefish/js-util-time'

Starter.startAsync(async () => {
  while (true) {
    console.log(2)
    new Remote(`https://mainnet.infura.io/v3/aaa3fc062661462784b334a1a5c51940`)
    await Timer.sleep(2000)
  }
})