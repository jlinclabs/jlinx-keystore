const Path = require('path')
const fs = require('fs/promises')
const safetyCatch = require('safety-catch')
const Debug = require('debug')

const debug = Debug('jlinx:filemap')

module.exports = class Filemap {
  constructor (storagePath) {
    this.storagePath = storagePath
    this._ready = this._open()
  }

  [Symbol.for('nodejs.util.inspect.custom')] (depth, opts) {
    let indent = ''
    if (typeof opts.indentationLvl === 'number') { while (indent.length < opts.indentationLvl) indent += ' ' }
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + ')'
  }

  ready () { return this._ready }

  async _open () {
    debug('opening', this.storagePath)
    await fs.mkdir(this.storagePath).catch(safetyCatch)
  }

  _path (key) { return Path.join(this.storagePath, key) }

  async get (key) {
    debug('get', key)
    try {
      return await fs.readFile(this._path(key))
    } catch (error) {
      if (error && error.code === 'ENOENT') return
      throw error
    }
  }

  async has (key) {
    debug('has', key)
    try {
      await fs.stat(this._path(key))
      return true
    } catch (error) {
      if (error.code === 'ENOENT') return false
      throw error
    }
  }

  async set (key, value) {
    debug('set', key)
    await fs.writeFile(this._path(key), value)
    return true
  }

  async delete (key) {
    debug('delete', key)
    try {
      await fs.unlink(this._path(key))
      return true
    } catch (error) {
      if (error && error.code === 'ENOENT') return
      throw error
    }
  }
}
