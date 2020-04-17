import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getService, getStore, clearLocalStorage } from 'emberclear/tests/helpers';
import ChannelVerifier from 'emberclear/services/channels/channel-verifier';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';
import User from 'emberclear/models/user';

module('Unit | Service | channels/channel-verifier', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: ChannelVerifier;

  hooks.beforeEach(function () {
    service = getService('channels/channel-verifier');
  });

  module('starting channel', function () {
    module('invalid', function () {
      test('no admin', async function (assert) {
        const store = getStore();
        let channelContextChain = store.createRecord('channel-context-chain', {
          members: [],
        });
        assert.notOk(await service.isValidChain(channelContextChain));
      });

      test('no members', async function (assert) {
        const store = getStore();
        let admin = await buildUser('admin');
        let channelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [],
        });
        assert.notOk(await service.isValidChain(channelContextChain));
      });

      test('more than 1 member', async function (assert) {
        const store = getStore();
        let admin = await buildUser('admin');
        let member1 = await buildUser('member1');
        let channelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin, member1],
        });
        assert.notOk(await service.isValidChain(channelContextChain));
      });

      test('member is not admin', async function (assert) {
        const store = getStore();
        let admin = await buildUser('admin');
        let member1 = await buildUser('member');
        let channelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1],
        });
        assert.notOk(await service.isValidChain(channelContextChain));
      });
    });

    test('valid', async function (assert) {
      const store = getStore();
      let admin = await buildUser('admin');
      let channelContextChain = store.createRecord('channel-context-chain', {
        admin: admin,
        members: [admin],
      });
      assert.ok(await service.isValidChain(channelContextChain));
    });
  });

  module('subsequent chains', function (hooks) {
    let addMember1VoteChain!: VoteChain;
    let admin!: User;
    let member1!: User;

    hooks.beforeEach(async function () {
      const store = getStore();
      admin = await buildUser('admin');
      member1 = await buildUser('member1');
      addMember1VoteChain = store.createRecord('vote-chain', {
        yes: [admin],
        no: [],
        remaining: [],
        action: VOTE_ACTION.ADD,
        target: member1,
        key: admin,
        previousVoteChain: undefined,
        signature: undefined,
      });
      addMember1VoteChain.signature = await signatureOf(addMember1VoteChain, admin);
    });

    module('valid', function () {
      test('add a member', async function (assert) {
        const store = getStore();
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
        });
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
          supportingVote: addMember1VoteChain,
        });
        assert.ok(await service.isValidChain(currentChannelContextChain));
      });

      test('remove a member', async function (assert) {
        const store = getStore();
        let vote2 = store.createRecord('vote-chain', {
          yes: [admin],
          no: [],
          remaining: [member1],
          action: VOTE_ACTION.REMOVE,
          target: member1,
          key: admin,
          previousVoteChain: undefined,
          signature: undefined,
        });
        vote2.signature = await signatureOf(vote2, admin);
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
        });
        let previousChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
          supportingVote: addMember1VoteChain,
        });
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
          previousChain: previousChannelContextChain,
          supportingVote: vote2,
        });
        assert.ok(await service.isValidChain(currentChannelContextChain));
      });

      test('promote a member', async function (assert) {
        const store = getStore();
        let vote2 = store.createRecord('vote-chain', {
          yes: [admin],
          no: [],
          remaining: [member1],
          action: VOTE_ACTION.PROMOTE,
          target: member1,
          key: admin,
          previousVoteChain: undefined,
          signature: undefined,
        });
        vote2.signature = await signatureOf(vote2, admin);
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
        });
        let previousChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
          supportingVote: addMember1VoteChain,
        });
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: member1,
          members: [admin, member1],
          previousChain: previousChannelContextChain,
          supportingVote: vote2,
        });
        assert.ok(await service.isValidChain(currentChannelContextChain));
      });
    });

    module('invalid', function () {
      test('when a previous chain is invalid', async function (assert) {
        const store = getStore();
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1],
        });
        // No need to generate supporting vote as previous channel chains are checked first
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
        });
        assert.notOk(await service.isValidChain(currentChannelContextChain));
      });

      test('when the supporting vote chain is invalid', async function (assert) {
        const store = getStore();
        let admin = await buildUser('admin');
        let member1 = await buildUser('member1');
        let vote = store.createRecord('vote-chain', {
          yes: [admin],
          no: [],
          remaining: [],
          action: VOTE_ACTION.ADD,
          target: member1,
          key: admin,
          previousVoteChain: undefined,
          signature: undefined,
        });
        vote.signature = await signatureOf(vote, admin);
        vote.action = VOTE_ACTION.REMOVE;
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
        });
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
          supportingVote: vote,
        });
        assert.notOk(await service.isValidChain(currentChannelContextChain));
      });

      module('when vote is not completed positive', function () {
        test('when votes are in a tie and admin has not voted yes', async function (assert) {
          const store = getStore();
          let member2 = await buildUser('member2');
          let vote2 = store.createRecord('vote-chain', {
            yes: [member1],
            no: [],
            remaining: [admin],
            action: VOTE_ACTION.ADD,
            target: member2,
            key: member1,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, member1);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, member2, admin],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when yes does not outweigh no and remaining', async function (assert) {
          const store = getStore();
          let vote = store.createRecord('vote-chain', {
            yes: [],
            no: [],
            remaining: [admin],
            action: VOTE_ACTION.ADD,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote.signature = await signatureOf(vote, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: vote,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });
      });

      test('VOTE_ACTION not valid option', async function (assert) {
        const store = getStore();
        let vote = store.createRecord('vote-chain', {
          yes: [],
          no: [],
          remaining: [admin],
          action: 'invalid vote action',
          target: member1,
          key: admin,
          previousVoteChain: undefined,
          signature: undefined,
        });
        vote.signature = await signatureOf(vote, admin);
        let originalChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [admin],
        });
        let currentChannelContextChain = store.createRecord('channel-context-chain', {
          admin: admin,
          members: [member1, admin],
          previousChain: originalChannelContextChain,
          supportingVote: vote,
        });
        assert.notOk(await service.isValidChain(currentChannelContextChain));
      });

      module('VOTE_ACTION = ADD', function () {
        test('when other members are added outside of what the target specifies', async function (assert) {
          const store = getStore();
          let member2 = await buildUser('member2');
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin, member2],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when other members are removed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when admin is changed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: member1,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });
      });

      module('VOTE_ACTION = REMOVE', function () {
        test('when other members are added outside of what the target specifies', async function (assert) {
          const store = getStore();
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when other members are removed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let vote2 = store.createRecord('vote-chain', {
            yes: [admin],
            no: [],
            remaining: [member1],
            action: VOTE_ACTION.REMOVE,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when admin is changed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let vote2 = store.createRecord('vote-chain', {
            yes: [admin],
            no: [],
            remaining: [member1],
            action: VOTE_ACTION.REMOVE,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: member1,
            members: [admin],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });
      });

      module('VOTE_ACTION = PROMOTE', function () {
        test('when other members are added outside of what the target specifies', async function (assert) {
          const store = getStore();
          let member2 = await buildUser('member2');
          let vote2 = store.createRecord('vote-chain', {
            yes: [admin],
            no: [],
            remaining: [member1],
            action: VOTE_ACTION.PROMOTE,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: member1,
            members: [member1, admin, member2],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when other members are removed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let vote2 = store.createRecord('vote-chain', {
            yes: [admin],
            no: [],
            remaining: [member1],
            action: VOTE_ACTION.PROMOTE,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: member1,
            members: [member1],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });

        test('when admin is changed outside of what the target specifies', async function (assert) {
          const store = getStore();
          let vote2 = store.createRecord('vote-chain', {
            yes: [admin],
            no: [],
            remaining: [member1],
            action: VOTE_ACTION.PROMOTE,
            target: member1,
            key: admin,
            previousVoteChain: undefined,
            signature: undefined,
          });
          vote2.signature = await signatureOf(vote2, admin);
          let originalChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin],
          });
          let previousChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [member1, admin],
            previousChain: originalChannelContextChain,
            supportingVote: addMember1VoteChain,
          });
          let currentChannelContextChain = store.createRecord('channel-context-chain', {
            admin: admin,
            members: [admin, member1],
            previousChain: previousChannelContextChain,
            supportingVote: vote2,
          });
          assert.notOk(await service.isValidChain(currentChannelContextChain));
        });
      });
    });
  });
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
