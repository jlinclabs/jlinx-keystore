
const test = require('tape')
const Keystore = require('../')
const b4a = require('b4a')
const { withDir } = require('./helpers')

test('simple', async t => {
  t.same(typeof Keystore, 'function')

  await withDir(async dir => {
    const keys = new Keystore(dir.path)

    const signatron = await keys.createSigning()
    t.same(signatron.publicKey.length, 43)
    t.same(typeof signatron.valid, 'function')
    t.same(typeof signatron.sign, 'function')
    t.same(typeof signatron.verify, 'function')
    t.ok(await signatron.valid())
    t.ok(
      await signatron.verify(
        b4a.from('messsage'),
        await signatron.sign(b4a.from('messsage'))
      )
    )

    const signatron2 = await keys.get(signatron.publicKey)
    t.same(signatron2.publicKey.length, 43)
    t.same(typeof signatron2.valid, 'function')
    t.same(typeof signatron2.sign, 'function')
    t.same(typeof signatron2.verify, 'function')
    t.ok(await signatron2.valid())
    t.ok(
      await signatron2.verify(
        b4a.from('messsage'),
        await signatron2.sign(b4a.from('messsage'))
      )
    )

    const encryptatron = await keys.createEncrypting()
    t.same(encryptatron.publicKey.length, 43)
    t.same(typeof encryptatron.valid, 'function')
    t.same(typeof encryptatron.encrypt, 'function')
    t.same(typeof encryptatron.decrypt, 'function')
    t.ok(await encryptatron.valid())
    // t.same(
    //   b4a.from('messsage'),
    //   await encryptatron.decrypt(
    //     await encryptatron.encrypt(b4a.from('messsage'))
    //   )
    // )
  })
})
