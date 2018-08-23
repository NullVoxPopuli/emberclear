import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageProcessor from 'emberclear/services/messages/processor';

import { getService, clearLocalStorage, stubService } from 'emberclear/tests/helpers';
import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';

module('Acceptance | Send/Receive Encryption', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; }
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' }
    ]);
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
