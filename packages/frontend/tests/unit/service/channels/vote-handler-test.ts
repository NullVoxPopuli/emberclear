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
import { identityEquals, identitiesIncludes } from 'emberclear/utils/identity-comparison';

module('Unit | Service | channels/vote-handler', function (hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

  test('it exists', function (assert) {
    let service = getService('channels/vote-handler');
    assert.ok(service);
  });

  module('handle', function (hooks) {
    let baseChannelContextChain: ChannelContextChain;
    let secondChannelContextChain: ChannelContextChain;
    let thirdChannelContextChain: ChannelContextChain;
    let me = getService('current-user');
    const sender = await buildUser('sender');
    const thirdMember = await buildUser('thirdMember');

    hooks.beforeEach(async function () {
      const store = getStore();
      baseChannelContextChain = store.createRecord('channelContextChain', {
        admin: me,
        members: [me],
        supportingVote: undefined,
        previousChain: undefined,
      });

      let secondChannelVoteChain = store.createRecord('voteChain', {
        remaining: [],
        yes: [me],
        no: [],
        target: sender,
        action: VOTE_ACTION.ADD,
        key: me,
        previousVoteChain: undefined,
        signature: undefined,
      });
      secondChannelVoteChain.signature = await signatureOf(
        secondChannelVoteChain,
        await me.currentUser()!
      );

      secondChannelContextChain = store.createRecord('channelContextChain', {
        admin: me,
        members: [me, sender],
        supportingVote: secondChannelVoteChain,
        previousChain: baseChannelContextChain,
      });

      let thirdChannelVoteChain = store.createRecord('voteChain', {
        remaining: [sender],
        yes: [me],
        no: [],
        target: thirdMember,
        action: VOTE_ACTION.ADD,
        key: me,
        previousVoteChain: undefined,
        signature: undefined,
      });
      thirdChannelVoteChain.signature = await signatureOf(thirdChannelVoteChain, me.currentUser()?);
      thirdChannelContextChain = store.createRecord('channelContextChain', {
        admin: me,
        members: [me, sender, thirdMember],
        supportingVote: secondChannelVoteChain,
        previousChain: secondChannelContextChain,
      });
    });

    test('the sender is not in our channel context', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const messageFactory = getService('messages/factory');
      let channelId = uuid();
      let receivedChannel = store.createRecord('channel', {
        id: channelId,
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let message: StandardMessage = {
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
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: channelId,
        members: [me, thirdMember],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the existing vote is not defined', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const messageFactory = getService('messages/factory');
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let message: StandardMessage = {
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
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
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
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender tries to vote for somebody else', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let voteChain = store.createRecord('voteChain', {
        remaining: [me, sender],
        yes: [thirdMember],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: thirdMember,
        previousVoteChain: undefined,
        signature: undefined,
      });
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends an invalid vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let voteChain = store.createRecord('voteChain', {
        remaining: [thirdMember],
        yes: [sender],
        no: [me],
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends an existing active vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let voteChain = store.createRecord('voteChain', {
        remaining: [me, thirdMember],
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [vote],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends a new vote', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let voteChain = store.createRecord('voteChain', {
        remaining: [me, thirdMember],
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };
      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return vote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 1);
      assert.equal(ourChannel.activeVotes.toArray().get(0).id, vote.id);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends an existing vote but vote is not complete', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteChainId = uuid();
      let ourVoteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [sender, me],
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
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [me],
        yes: [thirdMember],
        no: [sender],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [voteChain],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };

      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [ourVote],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 1);
      assert.equal(ourChannel.activeVotes.toArray().get(0).id, ourVote.id);
      assert.equal(ourVote.voteChain.id, vote.id);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends an existing vote and vote is completed negatively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteChainId = uuid();
      let ourVoteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [sender, me],
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
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [me],
        yes: [],
        no: [sender, thirdMember],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });
      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [voteChain],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };

      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [ourVote],
        contextChain: undefined /**doesn't get used and would be a pain to set up */,
      });
      stubService('channels/find-or-create', {
        findOrCreateChannel() {
          return ourChannel;
        },
        findOrCreateVote() {
          return ourVote;
        },
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, vote.id);
      assert.equal(ourChannel.contextChain, undefined);
    });

    test('the sender sends an existing add vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteChainId = uuid();
      let ourVoteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [sender, me],
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
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [me],
        yes: [sender, thirdMember],
        no: [],
        target: memberToAdd,
        action: VOTE_ACTION.ADD,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });

      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [voteChain],
        contextChain: thirdChannelContextChain,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };

      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
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
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, vote.id);
      assert.equal(ourChannel.contextChain.admin, me);
      assert.equal(ourChannel.contextChain.members.toArray().length, 4);
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), me.record?));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), sender));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), thirdMember));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), memberToAdd));
      assert.equal(ourChannel.contextChain.supportingVote, vote.voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain.id, thirdChannelContextChain.id);
    });

    test('the sender sends an existing promote vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteChainId = uuid();
      let ourVoteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [sender, me],
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
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [me],
        yes: [sender, thirdMember],
        no: [],
        target: sender,
        action: VOTE_ACTION.PROMOTE,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });

      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [voteChain],
        contextChain: thirdChannelContextChain,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };

      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
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
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, vote.id);
      assert.equal(ourChannel.contextChain.admin, sender);
      assert.equal(ourChannel.contextChain.members.toArray().length, 3);
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), me.record?));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), sender));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), thirdMember));
      assert.equal(ourChannel.contextChain.supportingVote, vote.voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain.id, thirdChannelContextChain.id);
    });

    test('the sender sends a remove existing vote and vote is completed positively', async function (assert) {
      const store = getStore();
      const me = getService('current-user');
      const sender = await buildUser('sender');
      const thirdMember = await buildUser('thirdMember');
      const memberToAdd = await buildUser('memberToAdd');
      const messageFactory = getService('messages/factory');
      const voteChainId = uuid();
      let ourVoteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [sender, me],
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
        voteChain: ourVoteChain,
      });

      let voteChain = store.createRecord('voteChain', {
        id: voteChainId,
        remaining: [me],
        yes: [sender, thirdMember],
        no: [],
        target: sender,
        action: VOTE_ACTION.REMOVE,
        key: sender,
        previousVoteChain: ourVoteChain,
        signature: undefined,
      });
      voteChain.signature = await signatureOf(voteChain, sender);
      let vote = store.createRecord('vote', {
        voteChain: voteChain,
      });

      let receivedChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
        activeVotes: [voteChain],
        contextChain: thirdChannelContextChain,
      });
      let message: StandardMessage = {
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
          metadata: buildVote(vote),
        },
        channelInfo: buildChannelInfo(receivedChannel),
      };

      let ourChannel = store.createRecord('channel', {
        id: uuid(),
        members: [me, thirdMember, sender],
        admin: me,
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
      });
      const service = getService('channels/vote-handler');
      service.handleChannelVote(messageFactory.buildNewReceivedMessage(message, sender), message);

      assert.equal(ourChannel.activeVotes.toArray().length, 0);
      assert.equal(ourVote.voteChain.id, vote.id);
      assert.equal(ourChannel.contextChain.admin, me);
      assert.equal(ourChannel.contextChain.members.toArray().length, 2);
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), me.record?));
      assert.ok(identitiesIncludes(ourChannel.contextChain.members.toArray(), thirdMember));
      assert.equal(ourChannel.contextChain.supportingVote, vote.voteChain.id);
      assert.equal(ourChannel.contextChain.previousChain.id, thirdChannelContextChain.id);
    });
  });
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
