
const test = require('tape')
const Keystore = require('../')
const { withDir } = require('./helpers')
const {
  createSigningKeyPair,
  createEncryptingKeyPair
} = require('jlinx-util')

test('simple', async t => {
  t.same(typeof Keystore, 'function')

  await withDir(async dir => {
    const keys = new Keystore(dir.path)

    const signingKeyPair = createSigningKeyPair()

    t.same(await keys.has(signingKeyPair.publicKey), false)
    t.same(await keys.get(signingKeyPair.publicKey), undefined)
    t.same(await keys.put(signingKeyPair), true)
    t.same(await keys.has(signingKeyPair.publicKey), true)
    t.same(
      await keys.get(signingKeyPair.publicKey),
      signingKeyPair.secretKey
    )
    t.same(await keys.delete(signingKeyPair.publicKey), true)
    t.same(await keys.has(signingKeyPair.publicKey), false)
    t.same(await keys.get(signingKeyPair.publicKey), undefined)

    const encryptingKeyPair = createEncryptingKeyPair()
    t.same(await keys.put(encryptingKeyPair), true)
    t.same(
      await keys.get(encryptingKeyPair.publicKey),
      encryptingKeyPair.secretKey
    )
  })
})
