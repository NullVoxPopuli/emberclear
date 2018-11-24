import { module, test } from 'qunit';

import Identity from 'emberclear/src/data/models/identity/model';
import Message from 'emberclear/src/data/models/message/model';

import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';

import { toHex } from 'emberclear/src/utils/string-encoding';
import { encryptForSocket } from './encryptor';
import { decryptFromSocket } from './decryptor';
import { build as toPayloadJson } from './builder';

module('Integration | Send/Receive Encryption', function(hooks) {
  let bob!: Identity;
  let alice!: Identity;

  hooks.beforeEach(async function() {
    const bobKeys = await generateAsymmetricKeys();
    const aliceKeys = await generateAsymmetricKeys();

    bob = {
      privateKey: bobKeys.privateKey,
      publicKey: bobKeys.publicKey
    } as Identity;

    alice = {
      privateKey: aliceKeys.privateKey,
      publicKey: aliceKeys.publicKey
    } as Identity;
  });

  test('round-trip encrypt-decrypt should return the same message', async function(assert) {
    const message = {
      body: 'hi'
    } as Message;

    const payload = toPayloadJson(message, alice);
    const encrypted = await encryptForSocket(payload, bob, alice);
    const fakeSocketMessage = { message: encrypted, uid: toHex(alice.publicKey!) };
    const decrypted = await decryptFromSocket(fakeSocketMessage, bob.privateKey!);

    assert.equal(decrypted.message.body, 'hi');
  });
});
