import { module, test } from 'qunit';
import {
  clearLocalStorage,
  setupCurrentUser,
  getService,
  getStore,
  stubService,
} from 'emberclear/tests/helpers';
import { setupTest, skip } from 'ember-qunit';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import User from 'emberclear/models/user';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import { buildChannelContextChain } from 'emberclear/services/channels/-utils/channel-factory';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { TYPE, TARGET } from 'emberclear/models/message';
import { v4 as uuid } from 'uuid';

module('Unit | Service | channels/message-handler', function (hooks) {
  setupTest(hooks);
  setupCurrentUser(hooks);
  clearLocalStorage(hooks);

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

  test('Message ignored when sender is not in channel', async function (assert) {
    const store = getStore();
    const messageFactory = getService('messages/factory');
    const channelId = uuid();
    let message: StandardMessage = {
      id: uuid(),
      type: TYPE.CHAT,
      target: TARGET.CHANNEL,
      to: channelId,
      ['time_sent']: new Date(),
      client: 'tests',
      ['client_version']: '0',
      sender: {
        uid: thirdMember.uid,
        name: `user with id: ${thirdMember.id}`,
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
        contextChain: buildChannelContextChain(secondChannelContextChain),
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

    const service = getService('channels/message-handler');
    await service.handleChannelMessage(
      messageFactory.buildNewReceivedMessage(message, thirdMember),
      message
    );

    assert.equal((await store.findAll('message')).toArray().length, 0);
  });

  test('Message accepted when sender is in channel', async function (assert) {
    const store = getStore();
    const messageFactory = getService('messages/factory');
    const channelId = uuid();
    let message: StandardMessage = {
      id: uuid(),
      type: TYPE.CHAT,
      target: TARGET.CHANNEL,
      to: channelId,
      ['time_sent']: new Date(),
      client: 'tests',
      ['client_version']: '0',
      sender: {
        uid: sender.uid,
        name: `user with id: ${sender.id}`,
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
    });

    const service = getService('channels/message-handler');
    await service.handleChannelMessage(
      messageFactory.buildNewReceivedMessage(message, sender),
      message
    );

    let messages = await store.findAll('message');
    assert.equal(messages.length, 1);
    console.error('printing received body');
    console.error(messages.toArray().get(0).body);
    console.error('printing sent body');
    console.error(message.message.body);
    assert.equal(messages.toArray().get(0).body, message.message.body);
    assert.equal(messages.toArray().get(0).sender?.uid, sender.uid);
  });

  skip("Info Sync message sent when sender's channel context is invalid", async function (assert) {
    //TODO add once this functionality is added
    assert.expect(0);
  });
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
