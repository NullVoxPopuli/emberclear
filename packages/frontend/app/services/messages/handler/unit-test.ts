import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import uuid from 'uuid';

import {
  getService,
  stubService,
  setupCurrentUser,
  clearLocalStorage,
  getStore,
} from 'emberclear/tests/helpers';

import { TYPE, TARGET } from 'emberclear/src/data/models/message/model';
import CurrentUserService from 'emberclear/services/current-user/service';

import ReceivedMessageHandler from './service';
import { attributesForContact } from 'emberclear/tests/helpers/factories/contact-factory';

module('Unit | Service | messages/handler', function(hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  test('it exists', function(assert) {
    let service = getService('messages/handler');
    assert.ok(service);
  });

  module('handle', function() {
    module('a chat message', function(hooks) {
      hooks.beforeEach(async function() {
        stubService('messages/auto-responder', {
          messageReceived() {},
          cameOnline() {},
        });
      });

      test('the message is saved', async function(assert) {
        const store = getStore();
        const service = getService<ReceivedMessageHandler>('messages/handler');
        const me = getService<CurrentUserService>('currentUser');
        const sender = await attributesForContact();

        const before = await store.findAll('message');
        const beforeCount = before.toArray().length;

        await service.handle({
          id: uuid(),
          type: TYPE.CHAT,
          target: TARGET.WHISPER,
          to: me.record!.uid,
          ['time_sent']: new Date(),
          client: 'tests',
          ['client_version']: '0',
          sender: {
            uid: sender.id,
            name: `user with id: ${sender.id}`,
            location: '',
          },
          message: {
            body: 'malformed, cleartext body',
            contentType: 'is this used?',
          },
        });

        const after = await store.findAll('message');

        assert.equal(after.length, beforeCount + 1);
      });
    });

    module('an emote message', function() {});

    module('a delivery confirmation', function() {});

    module('a disconnect message', function() {});

    module('a ping', function() {});

    module('an unknown type of message', function() {});
  });
});
