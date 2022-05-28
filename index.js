
const Debug = require('debug')
const b64 = require('urlsafe-base64')
const debug = Debug('jlinx:keystore')
const {
  createSigningKeyPair,
  createEncryptingKeyPair,
  validateSigningKeyPair,
  validateEncryptingKeyPair
} = require('jlinx-util')
const Filemap = require('./filemap')

module.exports = class Keystore {
  constructor (storagePath) {
    debug(storagePath)
    this._map = new Filemap(storagePath)
  }

  [Symbol.for('nodejs.util.inspect.custom')] (depth, opts) {
    let indent = ''
    if (typeof opts.indentationLvl === 'number') { while (indent.length < opts.indentationLvl) indent += ' ' }
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this._map.storagePath, 'string') + '\n' +
      indent + ')'
  }

  ready () { return this._map.ready() }

  async createSigning () {
    const keypair = createSigningKeyPair()
    await this.set(keypair)
    return keypair
  }

  async createEncrypting () {
    const keypair = createEncryptingKeyPair()
    await this.set(keypair)
    return keypair
  }

  put ({ publicKey, secretKey }) {
    if (!validKeyPair({ publicKey, secretKey })) throw new Error('invalid key pair')
    return this._map.set(b64.encode(publicKey), secretKey)
  }

  get (publicKey) {
    return this._map.get(b64.encode(publicKey))
  }

  has (publicKey) {
    return this._map.has(b64.encode(publicKey))
  }

  delete (publicKey) {
    return this._map.delete(b64.encode(publicKey))
  }
}

function validKeyPair ({ publicKey, secretKey }) {
  if (!secretKey) return false
  if (
    secretKey.byteLength === 64 &&
    validateSigningKeyPair({ publicKey, secretKey })
  ) return true
  if (
    secretKey.byteLength === 32 &&
    validateEncryptingKeyPair({ publicKey, secretKey })
  ) return true
  return false
}
