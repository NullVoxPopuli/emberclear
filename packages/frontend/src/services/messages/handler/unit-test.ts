import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import uuid from 'uuid';

import {
  getService,
  stubService,
  attributesForUser,
  setupCurrentUser,
  clearLocalStorage,
} from 'emberclear/tests/helpers';

import { TYPE, TARGET } from 'emberclear/src/data/models/message/model';
import IdentityService from 'emberclear/src/services/identity/service';

import ReceivedMessageHandler from './service';

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
        const store = getService('store');
        const service = getService<ReceivedMessageHandler>('messages/handler');
        const me = getService<IdentityService>('identity');
        const sender = await attributesForUser();

        const before = await store.findAll('message');
        const beforeCount = before.length;

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
