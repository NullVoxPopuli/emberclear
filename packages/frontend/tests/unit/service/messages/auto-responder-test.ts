import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import uuid from 'uuid';

import {
  getService,
  stubService,
  setupCurrentUser,
  clearLocalStorage,
  waitUntilTruthy,
} from 'emberclear/tests/helpers';

import Identity from 'emberclear/models/identity';
import Message, { TYPE, TARGET } from 'emberclear/models/message';

import { createContact } from 'emberclear/tests/helpers/factories/contact-factory';
import AutoResponder from 'emberclear/services/messages/auto-responder';

module('Unit | Service | messages/auto-responder', function(hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  test('it exists', function(assert) {
    let service = getService('messages/auto-responder');
    assert.ok(service);
  });

  module('cameOnline', function() {
    module('handling messages queued for resend', function() {
      module('there are no pending messages', function(hooks) {
        hooks.beforeEach(async function(assert) {
          const store = getService('store');
          const messages = await store.findAll('message');

          assert.equal(messages.length, 0, 'there are no messages');
        });

        test('no messages are sent', async function(assert) {
          assert.expect(1);

          const service = getService('messages/auto-responder');
          const somePerson = await createContact('some person');

          stubService('messages/dispatcher', {
            sendToUser: {
              perform(/* _response: Message, _to: Identity */) {
                assert.ok(false, 'this method should not get called');
              },
            },
          });

          service.cameOnline(somePerson);
        });
      });

      module('there are pending messages', function(hooks) {
        let somePerson: Identity;
        let service: AutoResponder;

        hooks.beforeEach(async function(assert) {
          service = getService('messages/auto-responder');
          somePerson = await createContact('some person');

          const store = getService('store');
          const me = getService('currentUser');
          let messages = await store.findAll('message');

          assert.equal(messages.length, 0, 'there are no messages');

          await store
            .createRecord('message', {
              to: somePerson.uid,
              queueForResend: true,
              sender: me.record,
            })
            .save();
          await store
            .createRecord('message', {
              to: somePerson.uid,
              queueForResend: true,
              sender: me.record,
            })
            .save();

          messages = await store.findAll('message');
          assert.equal(messages.length, 2, 'there are 2 messages');

          const pendingMessages = await store.query('message', {
            queueForResend: true,
            to: somePerson.uid,
          });

          assert.equal(pendingMessages.length, 2, 'there are 2 pending messages');
        });

        test('there are no longer any queued messages', async function(assert) {
          assert.expect(6);

          stubService('messages/dispatcher', {
            sendToUser: {
              perform(_response: Message, to: Identity) {
                assert.equal(to.uid, somePerson.uid, `message sent to: ${somePerson.name}`);
              },
            },
          });

          await service.cameOnline(somePerson);

          const store = getService('store');

          await waitUntilTruthy(async () => {
            let messages = await store.query('message', {
              queueForResend: true,
              to: somePerson.uid,
            });

            return messages.length === 0;
          });

          const messages = await store.query('message', {
            queueForResend: true,
            to: somePerson.uid,
          });

          assert.equal(messages.length, 0, 'there are no messages');
        });
      });
    });
  });

  module('messageReceived', function() {
    test('a delivery confirmation is built', async function(assert) {
      assert.expect(5);

      const me = getService('currentUser');

      await me.exists();

      const store = getService('store');
      const service = getService('messages/auto-responder');

      const sender = await createContact('some user');
      const receivedMessage = store.createRecord('message', {
        id: uuid(),
        sender,
        body: 'test message',
      });

      stubService('messages/dispatcher', {
        sendToUser: {
          perform(response: Message, to: Identity) {
            assert.equal(response.target, TARGET.MESSAGE);
            assert.equal(response.type, TYPE.DELIVERY_CONFIRMATION);
            assert.equal(response.to, receivedMessage.id);
            assert.equal(response.sender, me.record);
            assert.equal(to.publicKey, sender.publicKey);
          },
        },
      });

      service.messageReceived(receivedMessage);
    });
  });
});
