import Remote from "../src/remote";
import Starter from '@pefish/js-util-starter'
import Timer from '@pefish/js-util-time'
import TimeUtil from "@pefish/js-util-time";



class A {
  a: string
  constructor () {
    this.a = `111`
  }

  async publish(queneName: string, dataStr: string): Promise<void> {
    const method = async () => {
      console.log(this.a)
      await TimeUtil.sleep(12000)
    }
    return Promise.race([
      method(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      )
    ])
  }
}

Starter.startAsync(async () => {
  new A().publish(`a`, `22`)
})