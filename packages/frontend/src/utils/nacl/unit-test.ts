import * as nacl from './utils';
import { module, test } from 'qunit';

module('Unit | Utility | nacl', function() {
  test('libsodium uses wasm', async function(assert) {
    const sodium = await nacl.libsodium();
    const isUsingWasm = sodium.libsodium.usingWasm;

    assert.ok(isUsingWasm);
  });

  test('generateAsymmetricKeys | works', async function(assert) {
    const boxKeys = await nacl.generateAsymmetricKeys();

    assert.ok(boxKeys.publicKey);
    assert.ok(boxKeys.privateKey);
  });

  test('encryptFor/decryptFrom | works with Uint8Array', async function(assert) {
    const receiver = await nacl.generateAsymmetricKeys();
    const sender = await nacl.generateAsymmetricKeys();

    const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]); // hello
    const ciphertext = await nacl.encryptFor(msgAsUint8, receiver.publicKey, sender.privateKey);
    const decrypted = await nacl.decryptFrom(ciphertext, sender.publicKey, receiver.privateKey);

    assert.deepEqual(msgAsUint8, decrypted);
  });

  test('splitNonceFromMessage | separates the nonce', async function(assert) {
    const msg = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
    ];

    const messageWithNonce = Uint8Array.from([...msg, 25]);

    const [nonce, notTheNonce] = await nacl.splitNonceFromMessage(messageWithNonce);

    assert.deepEqual(nonce, Uint8Array.from(msg));
    assert.deepEqual(notTheNonce, Uint8Array.from([25]));
  });
});
