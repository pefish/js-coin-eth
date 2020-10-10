import * as utils from 'ethereumjs-util'
import BN from 'bn.js'

export default class ABI {
  static eventID (name, types) {
    var sig = name + '(' + types.map(elementaryName).join(',') + ')'
    return utils.keccak(new Buffer(sig))
  }

  static methodID (name, types) {
    return this.eventID(name, types).slice(0, 4)
  }

  static rawEncode (types, values): Buffer {
    var output = []
    var data = []

    var headLength = 32 * types.length

    for (let i = 0; i < types.length; i++) {
      var type = elementaryName(types[i])
      var value = values[i]
      var cur = encodeSingle(type, value)  // bytes的话就是长度加内容

      // Use the head/tail method for storing dynamic data
      if (isDynamic(type)) {  // string、bytes、数组都是动态类型
        output.push(encodeSingle('uint256', headLength))
        data.push(cur)
        headLength += cur.length
      } else {
        output.push(cur)
      }
    }

    return Buffer.concat(output.concat(data))
  }

  static rawDecode (types, data) {
    var ret = []
    data = new Buffer(data)
    var offset = 0
    for (let type1 of types) {
      var type = elementaryName(type1)
      var parsed = parseType(type)
      var decoded = decodeSingle(parsed, data, offset)
      offset += parsed.memoryUsage
      ret.push(decoded)
    }
    return ret
  }

  static simpleEncode (method) {
    var args = Array.prototype.slice.call(arguments).slice(1)
    var sig = parseSignature(method)

    // FIXME: validate/convert arguments
    if (args.length !== sig.args.length) {
      throw new Error('Argument count mismatch')
    }

    return Buffer.concat([ this.methodID(sig.method, sig.args), this.rawEncode(sig.args, args) ])
  }

  static simpleDecode (method, data) {
    var sig = parseSignature(method)

    // FIXME: validate/convert arguments
    if (!sig[`retargs`]) {
      throw new Error('No return values in method')
    }

    return this.rawDecode(sig[`retargs`], data)
  }

  static stringify (types, values) {
    var ret = []

    for (let i = 0; i < types.length; i++) {
      let type = types[i]
      var value = values[i]

      // if it is an array type, concat the items
      if (/^[^\[]+\[.*\]$/.test(type)) {
        value = value.map(function (item) {
          return stringify(type, item)
        }).join(', ')
      } else {
        value = stringify(type, value)
      }

      ret.push(value)
    }

    return ret
  }

  static solidityPack (types, values) {
    if (types.length !== values.length) {
      throw new Error('Number of types are not matching the values')
    }

    var size, num
    var ret = []

    for (var i = 0; i < types.length; i++) {
      var type = elementaryName(types[i])
      var value = values[i]

      if (type === 'bytes') {
        ret.push(value)
      } else if (type === 'string') {
        ret.push(new Buffer(value, 'utf8'))
      } else if (type === 'bool') {
        ret.push(new Buffer(value ? '01' : '00', 'hex'))
      } else if (type === 'address') {
        ret.push(utils.setLengthLeft(value, 20))
      } else if (type.startsWith('bytes')) {
        size = parseTypeN(type)
        if (size < 1 || size > 32) {
          throw new Error('Invalid bytes<N> width: ' + size)
        }

        ret.push(utils.setLengthRight(value, size))
      } else if (type.startsWith('uint')) {
        size = parseTypeN(type)
        if ((size % 8) || (size < 8) || (size > 256)) {
          throw new Error('Invalid uint<N> width: ' + size)
        }

        num = parseNumber(value)
        if (num.bitLength() > size) {
          throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength())
        }

        ret.push(num.toArrayLike(Buffer, 'be', size / 8))
      } else if (type.startsWith('int')) {
        size = parseTypeN(type)
        if ((size % 8) || (size < 8) || (size > 256)) {
          throw new Error('Invalid int<N> width: ' + size)
        }

        num = parseNumber(value)
        if (num.bitLength() > size) {
          throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength())
        }

        ret.push(num.toTwos(size).toArrayLike(Buffer, 'be', size / 8))
      } else {
        // FIXME: support all other types
        throw new Error('Unsupported or invalid type: ' + type)
      }
    }

    return Buffer.concat(ret)
  }

  static soliditySHA3 (types, values) {
    return utils.keccak(this.solidityPack(types, values))
  }

  static soliditySHA256 (types, values) {
    return utils.sha256(this.solidityPack(types, values))
  }

  static solidityRIPEMD160 (types, values) {
    return utils.ripemd160(this.solidityPack(types, values), true)
  }

  static fromSerpent (sig) {
    var ret = []
    for (var i = 0; i < sig.length; i++) {
      var type = sig[i]
      if (type === 's') {
        ret.push('bytes')
      } else if (type === 'b') {
        var tmp = 'bytes'
        var j = i + 1
        while ((j < sig.length) && isNumeric(sig[j])) {
          tmp += sig[j]
          j++
        }
        i = j - 1
        ret.push(tmp)
      } else if (type === 'i') {
        ret.push('int256')
      } else if (type === 'a') {
        ret.push('int256[]')
      } else {
        throw new Error('Unsupported or invalid type: ' + type)
      }
    }
    return ret
  }

  static toSerpent (types) {
    var ret = []
    for (var i = 0; i < types.length; i++) {
      var type = types[i]
      if (type === 'bytes') {
        ret.push('s')
      } else if (type.startsWith('bytes')) {
        ret.push('b' + parseTypeN(type))
      } else if (type === 'int256') {
        ret.push('i')
      } else if (type === 'int256[]') {
        ret.push('a')
      } else {
        throw new Error('Unsupported or invalid type: ' + type)
      }
    }
    return ret.join('')
  }
}

// Convert from short to canonical names
// FIXME: optimise or make this nicer?
function elementaryName (name) {
  if (name.startsWith('int[')) {
    return 'int256' + name.slice(3)
  } else if (name === 'int') {
    return 'int256'
  } else if (name.startsWith('uint[')) {
    return 'uint256' + name.slice(4)
  } else if (name === 'uint') {
    return 'uint256'
  } else if (name.startsWith('fixed[')) {
    return 'fixed128x128' + name.slice(5)
  } else if (name === 'fixed') {
    return 'fixed128x128'
  } else if (name.startsWith('ufixed[')) {
    return 'ufixed128x128' + name.slice(6)
  } else if (name === 'ufixed') {
    return 'ufixed128x128'
  }
  return name
}

// Parse N from type<N>
function parseTypeN (type) {
  return parseInt(/^\D+(\d+)$/.exec(type)[1], 10)
}

// Parse N,M from type<N>x<M>
function parseTypeNxM (type) {
  var tmp = /^\D+(\d+)x(\d+)$/.exec(type)
  return [ parseInt(tmp[1], 10), parseInt(tmp[2], 10) ]
}

// Parse N in type[<N>] where "type" can itself be an array type.
function parseTypeArray (type): string | number | null {
  var tmp = type.match(/(.*)\[(.*?)\]$/)
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10)
  }
  return null
}

function parseNumber (arg) {
  var type = typeof arg
  if (type === 'string') {
    if (arg.startsWith(`0x`)) {
      return new BN(arg.substr(2), 16)
    } else {
      return new BN(arg, 10)
    }
  } else if (type === 'number') {
    return new BN(arg)
  } else if (arg.toArray) {
    // assume this is a BN for the moment, replace with BN.isBN soon
    return arg
  } else {
    throw new Error('Argument is not a number')
  }
}

// someMethod(bytes,uint)
// someMethod(bytes,uint):(boolean)
function parseSignature (sig) {
  var tmp = /^(\w+)\((.+)\)$/.exec(sig)
  if (tmp.length !== 3) {
    throw new Error('Invalid method signature')
  }

  var args = /^(.+)\):\((.+)$/.exec(tmp[2])

  if (args !== null && args.length === 3) {
    return {
      method: tmp[1],
      args: args[1].split(','),
      retargs: args[2].split(',')
    }
  } else {
    return {
      method: tmp[1],
      args: tmp[2].split(',')
    }
  }
}

// Encodes a single item (can be dynamic array)
// @returns: Buffer
function encodeSingle (type, arg) {
  var size, num, ret, i

  if (type === 'address') {
    return encodeSingle('uint160', parseNumber(arg))
  } else if (type === 'bool') {
    return encodeSingle('uint8', arg ? 1 : 0)
  } else if (type === 'string') {
    return encodeSingle('bytes', new Buffer(arg, 'utf8'))
  } else if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (typeof arg.length === 'undefined') {
      throw new Error('Not an array?')
    }
    size = parseTypeArray(type)
    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size)
    }
    ret = []
    type = type.slice(0, type.lastIndexOf('['))
    if (typeof arg === 'string') {
      arg = JSON.parse(arg)
    }
    for (let arg1 of arg) {
      ret.push(encodeSingle(type, arg1))
    }
    if (size === 'dynamic') {
      var length = encodeSingle('uint256', arg.length)
      ret.unshift(length)
    }
    return Buffer.concat(ret)
  } else if (type === 'bytes') {
    arg = new Buffer(arg)

    ret = Buffer.concat([ encodeSingle('uint256', arg.length), arg ])  // 长度加内容

    if ((arg.length % 32) !== 0) {  // 内容是32字节的整数倍，不是就填充0
      ret = Buffer.concat([ ret, utils.zeros(32 - (arg.length % 32)) ])
    }

    return ret
  } else if (type.startsWith('bytes')) {
    size = parseTypeN(type)
    if (size < 1 || size > 32) {
      throw new Error('Invalid bytes<N> width: ' + size)
    }

    return utils.setLengthRight(arg, 32)
  } else if (type.startsWith('uint')) {
    size = parseTypeN(type)
    if ((size % 8) || (size < 8) || (size > 256)) {
      throw new Error('Invalid uint<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    if (num < 0) {
      throw new Error('Supplied uint is negative')
    }

    return num.toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('int')) {
    size = parseTypeN(type)
    if ((size % 8) || (size < 8) || (size > 256)) {
      throw new Error('Invalid int<N> width: ' + size)
    }

    num = parseNumber(arg)
    if (num.bitLength() > size) {
      throw new Error('Supplied int exceeds width: ' + size + ' vs ' + num.bitLength())
    }

    return num.toTwos(256).toArrayLike(Buffer, 'be', 32)
  } else if (type.startsWith('ufixed')) {
    size = parseTypeNxM(type)

    num = parseNumber(arg)

    if (num < 0) {
      throw new Error('Supplied ufixed is negative')
    }

    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))))
  } else if (type.startsWith('fixed')) {
    size = parseTypeNxM(type)

    return encodeSingle('int256', parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))))
  }

  throw new Error('Unsupported or invalid type: ' + type)
}

// Decodes a single item (can be dynamic array)
// @returns: array
// FIXME: this method will need a lot of attention at checking limits and validation
function decodeSingle (parsedType, data, offset) {
  if (typeof parsedType === 'string') {
    parsedType = parseType(parsedType)
  }
  var size, num, ret, i

  if (parsedType.name === 'address') {
    return decodeSingle(parsedType.rawType, data, offset).toArrayLike(Buffer, 'be', 20).toString('hex')
  } else if (parsedType.name === 'bool') {
    return decodeSingle(parsedType.rawType, data, offset).toString() === new BN(1).toString()
  } else if (parsedType.name === 'string') {
    var bytes = decodeSingle(parsedType.rawType, data, offset)
    return new Buffer(bytes, 'utf8').toString()
  } else if (parsedType.isArray) {
    // this part handles fixed-length arrays ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    ret = []
    size = parsedType.size

    if (parsedType.size === 'dynamic') {
      offset = decodeSingle('uint256', data, offset).toNumber()
      size = decodeSingle('uint256', data, offset).toNumber()
      offset = offset + 32
    }
    for (i = 0; i < size; i++) {
      var decoded = decodeSingle(parsedType.subArray, data, offset)
      ret.push(decoded)
      offset += parsedType.subArray.memoryUsage
    }
    return ret
  } else if (parsedType.name === 'bytes') {
    offset = decodeSingle('uint256', data, offset).toNumber()
    size = decodeSingle('uint256', data, offset).toNumber()
    return data.slice(offset + 32, offset + 32 + size)
  } else if (parsedType.name.startsWith('bytes')) {
    return data.slice(offset, offset + parsedType.size)
  } else if (parsedType.name.startsWith('uint')) {
    num = new BN(data.slice(offset, offset + 32), 16, 'be')
    if (num.bitLength() > parsedType.size) {
      throw new Error('Decoded int exceeds width: ' + parsedType.size + ' vs ' + num.bitLength())
    }
    return num
  } else if (parsedType.name.startsWith('int')) {
    num = new BN(data.slice(offset, offset + 32), 16, 'be').fromTwos(256)
    if (num.bitLength() > parsedType.size) {
      throw new Error('Decoded uint exceeds width: ' + parsedType.size + ' vs ' + num.bitLength())
    }

    return num
  } else if (parsedType.name.startsWith('ufixed')) {
    size = new BN(2).pow(new BN(parsedType.size[1]))
    num = decodeSingle('uint256', data, offset)
    if (!num.mod(size).isZero()) {
      throw new Error('Decimals not supported yet')
    }
    return num.div(size)
  } else if (parsedType.name.startsWith('fixed')) {
    size = new BN(2).pow(new BN(parsedType.size[1]))
    num = decodeSingle('int256', data, offset)
    if (!num.mod(size).isZero()) {
      throw new Error('Decimals not supported yet')
    }
    return num.div(size)
  }
  throw new Error('Unsupported or invalid type: ' + parsedType.name)
}

type ParseTypeResult = {
  rawType?: string,
  isArray?: boolean,
  name: string,
  size: any,
  memoryUsage: number,
  subArray?: ParseTypeResult
}

// Parse the given type
// @returns: {} containing the type itself, memory usage and (including size and subArray if applicable)
function parseType (type: string): ParseTypeResult {
  var size: string | number | null
  var ret: ParseTypeResult
  if (isArray(type)) {
    size = parseTypeArray(type)
    var newType = type.slice(0, type.lastIndexOf('['))
    const subArray = parseType(newType)
    ret = {
      isArray: true,
      name: type,
      size: size,
      memoryUsage: size === 'dynamic' ? 32 : subArray.memoryUsage * (size as number),
      subArray: subArray
    }
    return ret
  } else {
    var rawType: string
    switch (type) {
      case 'address':
        rawType = 'uint160'
        break
      case 'bool':
        rawType = 'uint8'
        break
      case 'string':
        rawType = 'bytes'
        break
    }
    ret = {
      rawType: rawType,
      name: type,
      memoryUsage: 32,
      size: 0,
    }

    if (type.startsWith('bytes') && type !== 'bytes' || type.startsWith('uint') || type.startsWith('int')) {
      ret.size = parseTypeN(type)
    } else if (type.startsWith('ufixed') || type.startsWith('fixed')) {
      ret.size = parseTypeNxM(type)
    }

    if (type.startsWith('bytes') && type !== 'bytes' && (ret.size < 1 || ret.size > 32)) {
      throw new Error('Invalid bytes<N> width: ' + ret.size)
    }
    if ((type.startsWith('uint') || type.startsWith('int')) && (ret.size % 8 || ret.size < 8 || ret.size > 256)) {
      throw new Error('Invalid int/uint<N> width: ' + ret.size)
    }
    return ret
  }
}

// Is a type dynamic?
function isDynamic (type) {
  // FIXME: handle all types? I don't think anything is missing now
  return (type === 'string') || (type === 'bytes') || (parseTypeArray(type) === 'dynamic')
}

// Is a type an array?
function isArray (type) {
  return type.lastIndexOf(']') === type.length - 1
}


function stringify (type, value) {
  if (type.startsWith('address') || type.startsWith('bytes')) {
    return '0x' + value.toString('hex')
  } else {
    return value.toString()
  }
}

// Serpent's users are familiar with this encoding
// - s: string
// - b: bytes
// - b<N>: bytes<N>
// - i: int256
// - a: int256[]

function isNumeric (c) {
  // FIXME: is this correct? Seems to work
  return (c >= '0') && (c <= '9')
}
