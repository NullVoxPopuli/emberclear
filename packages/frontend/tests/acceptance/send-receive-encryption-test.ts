import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageProcessor from 'emberclear/services/messages/processor';

import localforage from 'localforage';
import { getService } from 'emberclear/tests/helpers';
import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';

module('Acceptance | Send/Receive Encryption', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await localforage.clear();
  });

  test('round-trip encrypt-decrypt should return the same message', async function(assert) {
    const dispatcher = getService<MessageDispatcher>('messages/dispatcher');
    const processor = getService<MessageProcessor>('messages/processor');

    const bob = await generateAsymmetricKeys();
    const alice = await generateAsymmetricKeys();

    const message = { hi: 'hi!' };

    // alice sends to bob
    const encrypted = await dispatcher.encryptMessage(message, bob.publicKey, alice.privateKey);

    // bob receives from alice
    const decrypted = await processor.decryptMessage(encrypted, alice.publicKey, bob.privateKey)


    assert.deepEqual(decrypted, message);
  });
});
