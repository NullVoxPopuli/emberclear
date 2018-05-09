import * as nacl from './utils';
import { module, test } from 'qunit';

module('Unit | Utility | nacl', function() {

  test('libsodium uses wasm', async function(assert) {
    const sodium = await nacl.libsodium();
    const isUsingWasm = sodium.libsodium.usingWasm;

    assert.ok(isUsingWasm);
  });

  test('generateNewKeys | works', async function(assert) {
    const boxKeys = await nacl.generateNewKeys();

    assert.ok(boxKeys.publicKey);
    assert.ok(boxKeys.privateKey);
  });

  test('encryptFor/decryptFrom | works with Uint8Array', async function(assert) {
      const bob = await nacl.generateNewKeys();
      const alice = await nacl.generateNewKeys();

      const msg = 'hello';
      const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]);
      const ciphertext = await nacl.encryptFor(msg, bob.publicKey, alice.privateKey);
      const decrypted = await nacl.decryptFrom(ciphertext, bob.publicKey, bob.privateKey);

      assert.deepEqual(msgAsUint8, decrypted);
  });

  test('encrypt/decrypt | works', async function(assert) {
    const bob = await nacl.generateNewKeys();
    const alice = await nacl.generateNewKeys();

    // hello
    const msg = Uint8Array.from([104, 101, 108, 108, 111]);
    const ciphertext = await nacl.encrypt(msg, bob.publicKey, alice.privateKey);
    const decrypted = await nacl.decrypt(ciphertext, bob.publicKey, bob.privateKey);

    assert.deepEqual(msg, decrypted);
  });
});
