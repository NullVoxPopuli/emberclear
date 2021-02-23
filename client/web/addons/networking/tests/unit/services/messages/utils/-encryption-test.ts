// TODO:
/* eslint-disable @typescript-eslint/no-explicit-any */
import { module, test } from 'qunit';

import { generateAsymmetricKeys } from '@emberclear/crypto/workers/crypto/utils/nacl';
import {
  decryptFromSocket,
  encryptForSocket,
} from '@emberclear/crypto/workers/crypto/utils/socket';
import { toHex } from '@emberclear/encoding/string';
import { build as toPayloadJson } from '@emberclear/networking/services/messages/-utils/builder';

import type { KeyPair } from '@emberclear/crypto';

module('Integration | Send/Receive Encryption', function (hooks) {
  let bob!: KeyPair;
  let alice!: KeyPair;

  hooks.beforeEach(async function () {
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

  test('round-trip encrypt-decrypt should return the same message', async function (assert) {
    const message = {
      body: 'hi',
    } as any;

    const payload = toPayloadJson(message, alice as any);
    const encrypted = await encryptForSocket(payload, bob, alice);
    const fakeSocketMessage = { message: encrypted, uid: toHex(alice.publicKey) };
    const decrypted = await decryptFromSocket(fakeSocketMessage, bob.privateKey);

    assert.equal(decrypted.message.body, 'hi');
  });
});
