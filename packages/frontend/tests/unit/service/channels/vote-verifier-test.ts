import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';
import User from 'emberclear/models/user';

module('Unit | Service | channels/vote-verifier', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: VoteVerifier;

  hooks.beforeEach(function () {
    service = getService('channels/vote-verifier');
  });

  module('vote is valid', function () {
    test('when only one chain', async function (assert) {
      const store = getStore();
      let user1 = await buildUser('user1');
      let userToAdd = await buildUser('userToAdd');

      let currentVote = store.createRecord('vote-chain', {
        yes: [user1],
        no: [],
        remaining: [],
        action: VOTE_ACTION.ADD,
        target: userToAdd,
        key: user1,
        previousVoteChain: undefined,
        signature: undefined,
      });
      currentVote.signature = await signatureOf(currentVote, user1);

      assert.ok(await service.isValid(currentVote));
    });

    test('when there are many chains', async function (assert) {
      const store = getStore();

      let user1 = await buildUser('user1');
      let user2 = await buildUser('user2');
      let user3 = await buildUser('user3');
      let user4 = await buildUser('user4');
      let userToAdd = await buildUser('userToAdd');

      let firstVote = store.createRecord('vote-chain', {
        yes: [user1],
        no: [],
        remaining: [user2, user3, user4],
        action: VOTE_ACTION.ADD,
        target: userToAdd,
        key: user1,
        previousVoteChain: undefined,
        signature: undefined,
      });
      firstVote.signature = await signatureOf(firstVote, user1);

      let secondVote = store.createRecord('vote-chain', {
        yes: [user1, user2],
        no: [],
        remaining: [user3, user4],
        action: VOTE_ACTION.ADD,
        target: userToAdd,
        key: user2,
        previousVoteChain: firstVote,
        signature: undefined,
      });
      secondVote.signature = await signatureOf(secondVote, user2);

      let currentVote = store.createRecord('vote-chain', {
        yes: [user1, user2],
        no: [user3],
        remaining: [user4],
        action: VOTE_ACTION.ADD,
        target: userToAdd,
        key: user3,
        previousVoteChain: secondVote,
        signature: undefined,
      });
      currentVote.signature = await signatureOf(currentVote, user3);

      assert.ok(await service.isValid(currentVote));
    });
  });

  module('vote is not valid', function () {
    module('when there is a single chain', function () {
      test('when first voter is in both yes and no', async function (assert) {
        const store = getStore();
        let user1 = await buildUser('user1');
        let userToAdd = await buildUser('userToAdd');

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1],
          no: [user1],
          remaining: [],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user1,
          previousVoteChain: undefined,
          signature: undefined,
        });
        currentVote.signature = await signatureOf(currentVote, user1);

        assert.notOk(await service.isValid(currentVote));
      });

      test('when first voter is still in remaining', async function (assert) {
        const store = getStore();
        let user1 = await buildUser('user1');
        let userToAdd = await buildUser('userToAdd');

        let currentVote = store.createRecord('vote-chain', {
          yes: [],
          no: [],
          remaining: [user1],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user1,
          previousVoteChain: undefined,
          signature: undefined,
        });
        currentVote.signature = await signatureOf(currentVote, user1);

        assert.notOk(await service.isValid(currentVote));
      });
    });

    module('when there are many chains', function () {
      module('when voter was previously remaining', function (hooks) {
        const store = getStore();
        let user1: User;
        let user2: User;
        let userToAdd: User;
        let firstVote: VoteChain;

        hooks.beforeEach(async function () {
          user1 = await buildUser('user1');
          user2 = await buildUser('user2');
          userToAdd = await buildUser('userToAdd');
          firstVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: undefined,
            signature: undefined,
          });
          firstVote.signature = await signatureOf(firstVote, user1);
        });

        test('when stays remaining', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user2,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user2);

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both yes and no', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [user1, user2],
            no: [user2],
            remaining: [],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user2,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user2);

          assert.notOk(await service.isValid(currentVote));
        });
      });

      module('when voter was previously yes', function (hooks) {
        const store = getStore();
        let user1: User;
        let user2: User;
        let userToAdd: User;
        let firstVote: VoteChain;

        hooks.beforeEach(async function () {
          user1 = await buildUser('user1');
          user2 = await buildUser('user2');
          userToAdd = await buildUser('userToAdd');
          firstVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: undefined,
            signature: undefined,
          });
          firstVote.signature = await signatureOf(firstVote, user1);
        });

        test('when stays yes', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user1);

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both remaining and no', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user1, user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user1);

          assert.notOk(await service.isValid(currentVote));
        });
      });

      module('when voter was previously no', function (hooks) {
        const store = getStore();
        let user1: User;
        let user2: User;
        let userToAdd: User;
        let firstVote: VoteChain;

        hooks.beforeEach(async function () {
          user1 = await buildUser('user1');
          user2 = await buildUser('user2');
          userToAdd = await buildUser('userToAdd');
          firstVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: undefined,
            signature: undefined,
          });
          firstVote.signature = await signatureOf(firstVote, user1);
        });

        test('when stays no', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user1);

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both yes and remaining', async function (assert) {
          let currentVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user1, user2],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await signatureOf(currentVote, user1);

          assert.notOk(await service.isValid(currentVote));
        });
      });

      test('when target is changed', async function (assert) {
        const store = getStore();

        let user1 = await buildUser('user1');
        let user2 = await buildUser('user2');
        let user3 = await buildUser('user3');
        let userToAdd = await buildUser('userToAdd');

        let firstVote = store.createRecord('vote-chain', {
          yes: [user1],
          no: [],
          remaining: [user2],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user1,
          previousVoteChain: undefined,
          signature: undefined,
        });
        firstVote.signature = await sign(
          await hash(generateSortedVote(firstVote)),
          user1.privateSigningKey
        );

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [],
          remaining: [],
          action: VOTE_ACTION.ADD,
          target: user3,
          key: user2,
          previousVoteChain: firstVote,
          signature: undefined,
        });
        currentVote.signature = await signatureOf(currentVote, user2);

        assert.notOk(await service.isValid(currentVote));
      });

      test('when action is changed', async function (assert) {
        const store = getStore();

        let user1 = await buildUser('user1');
        let user2 = await buildUser('user2');
        let userToAdd = await buildUser('userToAdd');

        let firstVote = store.createRecord('vote-chain', {
          yes: [user1],
          no: [],
          remaining: [user2],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user1,
          previousVoteChain: undefined,
          signature: undefined,
        });
        firstVote.signature = await sign(
          await hash(generateSortedVote(firstVote)),
          user1.privateSigningKey
        );

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [],
          remaining: [],
          action: VOTE_ACTION.PROMOTE,
          target: userToAdd,
          key: user2,
          previousVoteChain: firstVote,
          signature: undefined,
        });
        currentVote.signature = await signatureOf(currentVote, user2);

        assert.notOk(await service.isValid(currentVote));
      });

      test('when a previous vote is modified', async function (assert) {
        const store = getStore();

        let user1 = await buildUser('user1');
        let user2 = await buildUser('user2');
        let user3 = await buildUser('user3');
        let user4 = await buildUser('user4');
        let userToAdd = await buildUser('userToAdd');

        let firstVote = store.createRecord('vote-chain', {
          yes: [user1],
          no: [],
          remaining: [user2, user3, user4],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user1,
          previousVoteChain: undefined,
          signature: undefined,
        });
        firstVote.signature = await signatureOf(firstVote, user1);

        let secondVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [],
          remaining: [user3, user4],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user2,
          previousVoteChain: firstVote,
          signature: undefined,
        });
        secondVote.signature = await await signatureOf(secondVote, user2);
        secondVote.no = [user4];
        secondVote.remaining = [user3];

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [user3, user4],
          remaining: [],
          action: VOTE_ACTION.ADD,
          target: userToAdd,
          key: user3,
          previousVoteChain: secondVote,
          signature: undefined,
        });
        currentVote.signature = await signatureOf(currentVote, user3);

        assert.notOk(await service.isValid(currentVote));
      });
    });
  });
});

async function signatureOf(vote: VoteChain, user: User): Promise<Uint8Array> {
  return sign(await hash(generateSortedVote(vote)), user.privateSigningKey);
}
