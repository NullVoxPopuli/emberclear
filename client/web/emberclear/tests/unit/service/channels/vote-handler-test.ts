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

import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';
import User from 'emberclear/models/user';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import { identitiesIncludes, identityEquals } from 'emberclear/utils/identity-comparison';
import {
  buildVote,
  buildChannelMember,
  buildChannelContextChain,
  buildVoteChain,
} from 'emberclear/services/channels/-utils/channel-factory';

module('Unit | Service | channels/vote-handler', function (hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  test('it exists', function (assert) {
    let service = getService('channels/vote-handler');

    assert.ok(service);
  });

  module('handle', async function (hooks) {
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

    test('the sender is not in our channel context', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
        target: TARGET.CHANNEL,
        to: channelId,
        ['time_sent']: new Date(),
        client: 'tests',
        ['client_version']: '0',
        sender: {
          uid: thirdMember.uid,
          name: `user with id: ${thirdMember.uid}`,
          location: '',
        },
        message: {
          body: 'malformed, cleartext body',
          contentType: 'is this used?',
          metadata: undefined,
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: secondChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, thirdMember),
        message
      );
      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.ok(identityEquals(ourChannel.contextChain.admin, secondChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        secondChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) =>
            identitiesIncludes(secondChannelContextChain.members.toArray(), member)
          )
      );
    });

    test('the existing vote is not defined', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const standardMe = buildChannelMember(me.record!);
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: undefined,
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return undefined;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender tries to vote for somebody else', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const standardMe = buildChannelMember(me.record!);
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let voteChain = store.createRecord('vote-chain', {
        remaining: [me.record, sender],
        yes: [thirdMember],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: buildVote(vote),
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [buildVote(vote)],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
        unloadVoteChain() {},
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends an invalid vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const standardMe = buildChannelMember(me.record!);
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let voteChain = store.createRecord('vote-chain', {
        remaining: [thirdMember],
        yes: [sender],
        no: [me.record],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: undefined,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: buildVote(vote),
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [buildVote(vote)],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
        unloadVoteChain() {},
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends an existing active vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const standardMe = buildChannelMember(me.record!);
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let voteChainFromSender = store.createRecord('vote-chain', {
        remaining: [me.record, thirdMember],
        yes: [sender],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: undefined,
        signature: undefined,
      });

      voteChainFromSender.signature = await signatureOf(voteChainFromSender, sender);
      let voteFromSender = store.createRecord('vote', {
        voteChain: voteChainFromSender,
      });
      let voteChainLocal = store.createRecord('vote-chain', {
        remaining: [me.record, thirdMember],
        yes: [sender],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: undefined,
        signature: undefined,
      });

      voteChainLocal.signature = await signatureOf(voteChainLocal, sender);
      let voteLocal = store.createRecord('vote', {
        voteChain: voteChainLocal,
      });
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: buildVote(voteFromSender),
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [buildVote(voteFromSender)],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [voteLocal],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return voteFromSender;
        },
        findOrCreateVoteChain() {
          return voteChainFromSender;
        },
        unloadVoteChain() {},
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 1);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends a new vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const standardMe = buildChannelMember(me.record!);
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let voteChain = store.createRecord('vote-chain', {
        remaining: [me.record, thirdMember],
        yes: [sender],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: undefined,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: buildVote(vote),
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [buildVote(vote)],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 1);
      assert.equal(ourChannel.activeVotes.toArray().get(0).id, vote.id);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends an existing vote but vote is not complete', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteId = uuid();
      const channelId = uuid();
      let ourVoteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [sender, me.record],
        yes: [thirdMember],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });

      ourVoteChain.signature = await signatureOf(ourVoteChain, thirdMember);
      let ourVote = store.createRecord('vote', {
        id: voteId,
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [me.record],
        yes: [thirdMember],
        no: [sender],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: {
            id: voteId,
            voteChain: buildVoteChain(voteChain),
          },
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [
            {
              id: voteId,
              voteChain: buildVoteChain(voteChain),
            },
          ],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [ourVote],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 1);
      assert.equal(ourChannel.activeVotes.toArray().get(0).id, ourVote.id);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends an existing vote and vote is completed negatively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteId = uuid();
      const channelId = uuid();
      let ourVoteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [sender, me.record],
        yes: [],
        no: [thirdMember],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });

      ourVoteChain.signature = await signatureOf(ourVoteChain, thirdMember);
      let ourVote = store.createRecord('vote', {
        id: voteId,
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [me.record],
        yes: [],
        no: [thirdMember, sender],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: {
            id: voteId,
            voteChain: buildVoteChain(voteChain),
          },
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [
            {
              id: voteId,
              voteChain: buildVoteChain(voteChain),
            },
          ],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [ourVote],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.ok(identityEquals(ourChannel.contextChain.admin, thirdChannelContextChain.admin));
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
    });

    test('the sender sends an existing add vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteId = uuid();
      const channelId = uuid();
      let ourVoteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [sender, me.record],
        yes: [thirdMember],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });

      ourVoteChain.signature = await signatureOf(ourVoteChain, thirdMember);
      let ourVote = store.createRecord('vote', {
        id: voteId,
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [me.record],
        yes: [thirdMember, sender],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: {
            id: voteId,
            voteChain: buildVoteChain(voteChain),
          },
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [
            {
              id: voteId,
              voteChain: buildVoteChain(voteChain),
            },
          ],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [ourVote],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, voteChain.id);
      assert.equal(ourChannel.contextChain.admin, me.record);
      assert.equal(ourChannel.contextChain.members.toArray().length, 4);
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), me.record!));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), sender));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), thirdMember));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), memberToAdd));
      assert.equal(ourChannel.contextChain.supportingVote!.id, voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain!.id, thirdChannelContextChain.id);
    });

    test('the sender sends an existing promote vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const messageFactory = getService('messages/factory');
      const voteId = uuid();
      const channelId = uuid();
      let ourVoteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [sender, me.record],
        yes: [thirdMember],
        no: [],
        target: sender,
        action: VOTE_ACTION.PROMOTE,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });

      ourVoteChain.signature = await signatureOf(ourVoteChain, thirdMember);
      let ourVote = store.createRecord('vote', {
        id: voteId,
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [me.record],
        yes: [thirdMember, sender],
        no: [],
        target: sender,
        action: VOTE_ACTION.PROMOTE,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: {
            id: voteId,
            voteChain: buildVoteChain(voteChain),
          },
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [
            {
              id: voteId,
              voteChain: buildVoteChain(voteChain),
            },
          ],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [ourVote],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, voteChain.id);
      assert.equal(ourChannel.contextChain.admin, sender);
      assert.equal(
        ourChannel.contextChain.members.toArray().length,
        thirdChannelContextChain.members.toArray().length
      );
      assert.ok(
        ourChannel.contextChain.members
          .toArray()
          .every((member) => identitiesIncludes(thirdChannelContextChain.members.toArray(), member))
      );
      assert.equal(ourChannel.contextChain.supportingVote!.id, voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain!.id, thirdChannelContextChain.id);
    });

    test('the sender sends a remove existing vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const messageFactory = getService('messages/factory');
      const voteId = uuid();
      const channelId = uuid();
      let ourVoteChain = store.createRecord('vote-chain', {
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

      ourVoteChain.signature = await signatureOf(ourVoteChain, thirdMember);
      let ourVote = store.createRecord('vote', {
        id: voteId,
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('vote-chain', {
        id: uuid(),
        remaining: [me.record],
        yes: [thirdMember, sender],
        no: [],
        target: sender,
        action: VOTE_ACTION.REMOVE,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });

      voteChain.signature = await signatureOf(voteChain, sender);
      let message: StandardMessage = {
        id: uuid(),
        type: TYPE.CHANNEL_VOTE,
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
          metadata: {
            id: voteId,
            voteChain: buildVoteChain(voteChain),
          },
        },
        channelInfo: {
          uid: channelId,
          name: 'test',
          activeVotes: [
            {
              id: voteId,
              voteChain: buildVoteChain(voteChain),
            },
          ],
          contextChain: buildChannelContextChain(thirdChannelContextChain),
        },
      };

      let ourChannel = store.createRecord('channel', {
        id: channelId,
        name: 'test',
        activeVotes: [ourVote],
        contextChain: thirdChannelContextChain,
      });

      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
        findOrCreateVoteChain() {
          return voteChain;
        },
      });
      const service = getService('channels/vote-handler');

      await service.handleChannelVote(
        messageFactory.buildNewReceivedMessage(message, sender),
        message
      );

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, voteChain.id);
      assert.equal(ourChannel.contextChain.admin, me.record!);
      assert.equal(ourChannel.contextChain.members.toArray().length, 2);
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), me.record!));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), thirdMember));
      assert.equal(ourChannel.contextChain.supportingVote!.id, voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain!.id, thirdChannelContextChain.id);
    });
  });
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
