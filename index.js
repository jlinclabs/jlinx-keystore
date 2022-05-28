
const Debug = require('debug')

const debug = Debug('jlinx:keystore')
const {
  sign,
  encrypt,
  keyToString,
  keyToBuffer,
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
    const { publicKey, secretKey } = createSigningKeyPair()
    const publicKeyAsString = keyToString(publicKey)
    debug('created signing key', publicKeyAsString, publicKeyAsString.length)
    debug('secretKey.byteLength', secretKey.byteLength)
    await this._map.set(publicKeyAsString, secretKey)
    return createSigningWrapper({ publicKeyAsString, publicKey, secretKey })
  }

  async createEncrypting () {
    const { publicKey, secretKey } = createEncryptingKeyPair()
    const publicKeyAsString = keyToString(publicKey)
    debug('created encrypting key', publicKeyAsString, publicKeyAsString.length)
    debug('secretKey.byteLength', secretKey.byteLength)
    await this._map.set(publicKeyAsString, secretKey)
    return createEncryptingWrapper({ publicKeyAsString, publicKey, secretKey })
  }

  async get (publicKeyAsString) {
    const secretKey = await this._map.get(publicKeyAsString)
    if (!secretKey) return
    debug('get', publicKeyAsString, secretKey.length)
    const publicKey = keyToBuffer(publicKeyAsString)
    if (secretKey.byteLength === 64) {
      return createSigningWrapper({ publicKeyAsString, publicKey, secretKey })
    }
    if (secretKey.byteLength === 32) {
      return createEncryptingWrapper({ publicKeyAsString, publicKey, secretKey })
    }
  }

  has (publicKeyAsString) {
    return this._map.has(publicKeyAsString)
  }

  delete (publicKeyAsString) {
    return this._map.delete(publicKeyAsString)
  }
}

function createSigningWrapper ({ publicKeyAsString, publicKey, secretKey }) {
  return {
    publicKey: publicKeyAsString,
    valid: () => validateSigningKeyPair({ publicKey, secretKey }),
    sign: signable => sign(signable, secretKey),
    verify: signable => sign(signable, secretKey)
  }
}

function createEncryptingWrapper ({ publicKeyAsString, publicKey, secretKey }) {
  return {
    publicKey: publicKeyAsString,
    valid: () => validateEncryptingKeyPair({ publicKey, secretKey }),
    encrypt: encryptable => encrypt(encryptable, secretKey),
    decrypt: encryptable => encrypt(encryptable, secretKey)
  }
}
