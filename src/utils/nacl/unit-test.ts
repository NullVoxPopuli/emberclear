import * as nacl from './utils';
import { module, test } from 'qunit';

module('Unit | Utility | nacl', function(hooks) {

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

  test('box encrypt | works', async function(assert) {
      const bob = await nacl.generateNewKeys();
      const alice = await nacl.generateNewKeys();

      const ciphertext = await nacl.encryptFor('hello', bob.publicKey, alice.privateKey);
      const decrypted = await nacl.decryptFrom(ciphertext, bob.publicKey, alice.privateKey);

      assert.equal('hello', decrypted);
  });
});
