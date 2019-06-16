import * as nacl from 'emberclear/workers/crypto/utils/nacl';
import { module, test, skip } from 'qunit';

module('Workers | Crypto | nacl', function() {
  skip('libsodium uses wasm', async function(assert) {
    assert.expect(0);
    // not using libsodium atm. WASM support seems unstable
    // (or libsodium is unstable between updates)
    // const sodium = await nacl.libsodium();
    // const isUsingWasm = (sodium as any).libsodium.usingWasm;

    // assert.ok(isUsingWasm);
  });

  test('generateAsymmetricKeys | works', async function(assert) {
    const boxKeys = await nacl.generateAsymmetricKeys();

    assert.ok(boxKeys.publicKey);
    assert.ok(boxKeys.privateKey);
  });

  test('derivePublicKey | works', async function(assert) {
    const boxKeys = await nacl.generateAsymmetricKeys();

    const publicKey = await nacl.derivePublicKey(boxKeys.privateKey);

    assert.deepEqual(publicKey, boxKeys.publicKey);
  });

  test('encryptFor/decryptFrom | works with Uint8Array', async function(assert) {
    const receiver = await nacl.generateAsymmetricKeys();
    const sender = await nacl.generateAsymmetricKeys();

    const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]); // hello
    const ciphertext = await nacl.encryptFor(msgAsUint8, receiver.publicKey, sender.privateKey);
    const decrypted = await nacl.decryptFrom(ciphertext, sender.publicKey, receiver.privateKey);

    assert.deepEqual(msgAsUint8, decrypted);
  });

  test('encryptFor/decryptFrom | works with large data', async function(assert) {
    const receiver = await nacl.generateAsymmetricKeys();
    const sender = await nacl.generateAsymmetricKeys();

    let bigMsg: number[] = [];
    for (let i = 0; i < 128; i++) {
      bigMsg = bigMsg.concat([104, 101, 108, 108, 111]);
    }

    const msgAsUint8 = Uint8Array.from(bigMsg); // hello * 128 = 640 Bytes
    const ciphertext = await nacl.encryptFor(msgAsUint8, receiver.publicKey, sender.privateKey);
    const decrypted = await nacl.decryptFrom(ciphertext, sender.publicKey, receiver.privateKey);

    assert.deepEqual(msgAsUint8, decrypted);
  });

  test('splitNonceFromMessage | separates the nonce', async function(assert) {
    // prettier-ignore
    const msg = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
    ];

    const messageWithNonce = Uint8Array.from([...msg, 25]);

    const [nonce, notTheNonce] = await nacl.splitNonceFromMessage(messageWithNonce);

    assert.deepEqual(nonce, Uint8Array.from(msg));
    assert.deepEqual(notTheNonce, Uint8Array.from([25]));
  });

  module('scenario tests', function() {
    // NOTE: Unless someone can convince me otherwise,
    //       I don't think signing messages has a place in this app.
    //
    //       You'd have to regularly send people your updated signature keys
    //       as you change machines.
    //
    //       Maybe if the data/message private key was derived from the
    //       signature private key?
    //
    //       unsure -- what would be the point of signing if one private key
    //       is a derivation of the other?

    test('key exchange', function(assert) {
      assert.expect(0);
    });

    module('encryption security', function() {
      test('a stranger cannot descrypt my message if it is not intended for them', async function(assert) {
        const recipient = await nacl.generateAsymmetricKeys();
        const stranger = await nacl.generateAsymmetricKeys();
        const me = await nacl.generateAsymmetricKeys();

        const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]); // hello
        const ciphertext = await nacl.encryptFor(msgAsUint8, recipient.publicKey, me.privateKey);
        const decrypted = await nacl.decryptFrom(ciphertext, me.publicKey, stranger.privateKey);

        assert.notDeepEqual(decrypted, msgAsUint8);
      });
    });
  });
});
