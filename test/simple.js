
const test = require('tape')
const Keystore = require('../')
const b4a = require('b4a')
const { withDir } = require('./helpers')

test('simple', async t => {
  t.same(typeof Keystore, 'function')

  await withDir(async dir => {
    const keys = new Keystore(dir.path)
    console.log(keys)
    t.same(await keys.put('one', '111'), true)
    t.same(await keys.get('one'), b4a.from('111'))
    t.same(await keys.delete('one'), true)
    t.same(await keys.get('one'), undefined)
  })
})
