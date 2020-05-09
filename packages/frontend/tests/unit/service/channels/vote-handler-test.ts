import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { v4 as uuid } from 'uuid';

import {
  getService,
  stubService,
  setupCurrentUser,
  clearLocalStorage,
  getStore,
} from 'emberclear/tests/helpers';

import { TYPE, TARGET } from 'emberclear/models/message';

import { attributesForContact } from 'emberclear/tests/helpers/factories/contact-factory';

module('Unit | Service | channels/vote-handler', function (hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  test('it exists', function (assert) {
    let service = getService('channels/vote-handler');
    assert.ok(service);
  });

  module('handle', function () {
    test('the sender is not in our channel context', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await attributesForContact();
      const thirdMember = await attributesForContact();
      let channelId = uuid();
      let channelInfo = {
        uid: channelId,
        name: 'channel',
        members: [
          { id: me.record!.uid, name: me.record!.name },
          { id: sender.id, name: `user with id: ${sender.id}` },
          { id: thirdMember.id, name: `user with id: ${thirdMember.id}` },
        ],
        admin: { id: me.record!.uid, name: me.record!.name },
        activeVotes: [
          /** TODO make active votes */
        ],
        contextChain: {
          id: uuid(),
          members: [
            { id: me.record!.uid, name: me.record!.name },
            { id: sender.id, name: `user with id: ${sender.id}` },
            { id: thirdMember.id, name: `user with id: ${thirdMember.id}` },
          ],
          admin: { id: me.record!.uid, name: me.record!.name },
          supportingVote: undefined /**TODO doesn't get used and would be a pain to set up */,
          previousChain: undefined /**TODO doesn't get used and would be a pain to set up */,
        },
      };
      let message = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
        target: TARGET.CHANNEL,
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
          metadata: undefined,
        },
        channelInfo: channelInfo,
      };
      let channel = store.createRecord('channel', {
        id: channelId,
        members: [me, thirdMember],
        admin: me,
        activeVotes: [],
        previousChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return channel;
        },
      });
      const service = getService('channels/vote-handler');
    });
  });
});
