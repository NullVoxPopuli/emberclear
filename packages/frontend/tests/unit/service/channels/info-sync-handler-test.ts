import { module, test } from 'qunit';
import {
  clearLocalStorage,
  setupCurrentUser,
  getService,
  getStore,
  stubService,
} from 'emberclear/tests/helpers';
import { setupTest } from 'ember-qunit';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import User from 'emberclear/models/user';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import {
  buildChannelContextChain,
  buildVote,
} from 'emberclear/services/channels/-utils/channel-factory';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { TYPE, TARGET } from 'emberclear/models/message';
import { v4 as uuid } from 'uuid';

module('Unit | Service | channels/info-sync-handler', function (hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  module('Info Sync Fulfill Received', function (hooks) {
    let baseChannelContextChain: ChannelContextChain;
    let secondChannelContextChain: ChannelContextChain;
    let thirdChannelContextChain: ChannelContextChain;
    let sender: User;
    let thirdMember: User;

    hooks.beforeEach(async function () {
      const me = getService('current-user');
      sender = await buildUser('sender');
      thirdMember = await buildUser('thirdMember');
      const store = getStore();
      baseChannelContextChain = store.createRecord('channel-context-chain', {
        admin: me.record!,
        members: [me.record!],
        supportingVote: undefined,
        previousChain: undefined,
      });

      let secondChannelVoteChain = store.createRecord('vote-chain', {
        remaining: [],
        yes: [me.record!],
        no: [],
        target: sender,
        action: VOTE_ACTION.ADD,
        key: me.record!,
        previousVoteChain: undefined,
        signature: undefined,
      });
      secondChannelVoteChain.signature = await signatureOf(secondChannelVoteChain, me.record!);

      secondChannelContextChain = store.createRecord('channel-context-chain', {
        admin: me.record!,
        members: [me.record!, sender],
        supportingVote: secondChannelVoteChain,
        previousChain: baseChannelContextChain,
      });

      let thirdChannelVoteChain = store.createRecord('vote-chain', {
        remaining: [sender],
        yes: [me.record!],
        no: [],
        target: thirdMember,
        action: VOTE_ACTION.ADD,
        key: me.record!,
        previousVoteChain: undefined,
        signature: undefined,
      });
      thirdChannelVoteChain.signature = await signatureOf(thirdChannelVoteChain, me.record!);
      thirdChannelContextChain = store.createRecord('channel-context-chain', {
        admin: me.record!,
        members: [me.record!, sender, thirdMember],
        supportingVote: thirdChannelVoteChain,
        previousChain: secondChannelContextChain,
      });
    });

    test('Received channel context is invalid', async function (assert) {
      const store = getStore();
      const messageFactory = getService('messages/factory');
      const channelId = uuid();
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.INFO_CHANNEL_SYNC_FULFILL,
        target: TARGET.CHANNEL,
        to: channelId,
        ['time_sent']: new Date(),
        client: 'tests',
        ['client_version']: '0',
        sender: {
          uid: sender.uid,
          name: `user with id: ${sender.uid}`,
          location: '',
        },
        message: {
          body: 'malformed, cleartext body',
          contentType: 'is this used?',
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let unloadChannelCalled = false;

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });
      stubService('channels/find-or-create', {
        updateOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateChannel() {
          return ourChannel;
        },
        unloadChannel() {
          unloadChannelCalled = true;
        },
      });
      stubService('channels/channel-verifier', {
        isValidChain() {
          return false;
        },
      });
      stubService('channels/vote-verifier', {
        isValid() {
          return true;
        },
      });

      const service = getService('channels/info-sync-handler');
      await service.handleInfoSyncFulfill(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.ok(unloadChannelCalled);
    });

    test('One or more received active votes are invalid', async function (assert) {
      const store = getStore();
      const messageFactory = getService('messages/factory');
      const channelId = uuid();
      const me = getService('current-user');
      const voteId = uuid();
      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [sender, me.record],
        yes: [thirdMember],
        no: [],
        target: sender,
        action: VOTE_ACTION.REMOVE,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, thirdMember);
      let vote = store.createRecord('vote', {
        id: voteId,
        voteChain: voteChain,
      });
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.INFO_CHANNEL_SYNC_FULFILL,
        target: TARGET.CHANNEL,
        to: channelId,
        ['time_sent']: new Date(),
        client: 'tests',
        ['client_version']: '0',
        sender: {
          uid: sender.uid,
          name: `user with id: ${sender.uid}`,
          location: '',
        },
        message: {
          body: 'malformed, cleartext body',
          contentType: 'is this used?',
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [buildVote(vote)],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let unloadChannelCalled = false;

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [vote],
        contextChain: thirdChannelContextChain,
      });
      stubService('channels/find-or-create', {
        updateOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateChannel() {
          return ourChannel;
        },
        unloadChannel() {
          unloadChannelCalled = true;
        },
      });
      stubService('channels/channel-verifier', {
        isValidChain() {
          return true;
        },
      });
      stubService('channels/vote-verifier', {
        isValid() {
          return false;
        },
      });

      const service = getService('channels/info-sync-handler');
      await service.handleInfoSyncFulfill(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.ok(unloadChannelCalled);
    });

    test('Channel Context is valid and we save it', async function (assert) {
      const store = getStore();
      const messageFactory = getService('messages/factory');
      const channelId = uuid();
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.INFO_CHANNEL_SYNC_FULFILL,
        target: TARGET.CHANNEL,
        to: channelId,
        ['time_sent']: new Date(),
        client: 'tests',
        ['client_version']: '0',
        sender: {
          uid: sender.uid,
          name: `user with id: ${sender.uid}`,
          location: '',
        },
        message: {
          body: 'malformed, cleartext body',
          contentType: 'is this used?',
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let unloadChannelCalled = false;

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });
      stubService('channels/find-or-create', {
        updateOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateChannel() {
          return ourChannel;
        },
        unloadChannel() {
          unloadChannelCalled = true;
        },
      });
      stubService('channels/channel-verifier', {
        isValidChain() {
          return true;
        },
      });
      stubService('channels/vote-verifier', {
        isValid() {
          return true;
        },
      });

      const service = getService('channels/info-sync-handler');
      await service.handleInfoSyncFulfill(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.notOk(unloadChannelCalled);
    });
  });

  module('Info Sync Request Received', function () {});
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
