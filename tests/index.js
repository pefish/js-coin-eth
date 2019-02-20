import 'node-assist'
import {privateToAddress} from 'ethereumjs-util'

const privateKey = Buffer.from([234, 84, 189, 197, 45, 22, 63, 136, 201, 58, 176, 97, 87, 130, 207, 113, 138, 46, 251, 158, 81, 167, 152, 154, 171, 27, 8, 6, 126, 156, 28, 95])
logger.error(privateKey)
const privateKey1 = `0x492191028c8fd5b4942a4edc004c76dd7427df1a9a33db2632135ab5011ed63b`.hexToBuffer()
logger.error(privateKey1)
const r = privateToAddress(privateKey1).toString('hex')
logger.error(r)
