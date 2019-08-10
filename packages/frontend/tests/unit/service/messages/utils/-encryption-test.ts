import { module, test } from 'qunit';

import { generateAsymmetricKeys } from 'emberclear/utils/nacl/utils';

import { toHex } from 'emberclear/utils/string-encoding';
import { encryptForSocket } from 'emberclear/services/messages/-utils/encryptor';
import { decryptFromSocket } from 'emberclear/services/messages/-utils/decryptor';
import { build as toPayloadJson } from 'emberclear/services/messages/-utils/builder';
import { KeyPair } from 'emberclear/models/user';

module('Integration | Send/Receive Encryption', function(hooks) {
  let bob!: KeyPair;
  let alice!: KeyPair;

  hooks.beforeEach(async function() {
    const bobKeys = await generateAsymmetricKeys();
    const aliceKeys = await generateAsymmetricKeys();

    bob = {
      privateKey: bobKeys.privateKey,
      publicKey: bobKeys.publicKey,
    };

    alice = {
      privateKey: aliceKeys.privateKey,
      publicKey: aliceKeys.publicKey,
    };
  });

  test('round-trip encrypt-decrypt should return the same message', async function(assert) {
    const message: any = {
      body: 'hi',
    };

    const payload = toPayloadJson(message, alice as any);
    const encrypted = await encryptForSocket(payload, bob, alice);
    const fakeSocketMessage = { message: encrypted, uid: toHex(alice.publicKey!) };
    const decrypted = await decryptFromSocket(fakeSocketMessage, bob.privateKey!);

    assert.equal(decrypted.message.body, 'hi');
  });
});
