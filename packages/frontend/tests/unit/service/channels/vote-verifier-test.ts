import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';
import { sign, hash } from 'emberclear/workers/crypto/utils/nacl';

module('Unit | Service | channels/vote-verifier', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: VoteVerifier;

  hooks.beforeEach(function () {
    service = getService('channels/vote-verifier');
  });

  test('it exists', function (assert) {
    assert.ok(service);
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
      currentVote.signature = await sign(
        await hash(generateSortedVote(currentVote)),
        user1.privateSigningKey
      );

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
      firstVote.signature = await sign(
        await hash(generateSortedVote(firstVote)),
        user1.privateSigningKey
      );

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
      secondVote.signature = await sign(
        await hash(generateSortedVote(secondVote)),
        user2.privateSigningKey
      );

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
      currentVote.signature = await sign(
        await hash(generateSortedVote(currentVote)),
        user3.privateSigningKey
      );

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
        currentVote.signature = await sign(
          await hash(generateSortedVote(currentVote)),
          user1.privateSigningKey
        );

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
        currentVote.signature = await sign(
          await hash(generateSortedVote(currentVote)),
          user1.privateSigningKey
        );

        assert.notOk(await service.isValid(currentVote));
      });
    });

    module('when there are many chains', function () {
      module('when voter was previously remaining', function () {
        test('when stays remaining', async function (assert) {
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
          firstVote.signature = await sign(
            await hash(generateSortedVote(firstVote)),
            user1.privateSigningKey
          );

          let currentVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2, user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user2,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user2.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both yes and no', async function (assert) {
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
          firstVote.signature = await sign(
            await hash(generateSortedVote(firstVote)),
            user1.privateSigningKey
          );

          let currentVote = store.createRecord('vote-chain', {
            yes: [user1, user2],
            no: [user2],
            remaining: [user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user2,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user2.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });
      });

      module('when voter was previously yes', function () {
        test('when stays yes', async function (assert) {
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
          firstVote.signature = await sign(
            await hash(generateSortedVote(firstVote)),
            user1.privateSigningKey
          );

          let currentVote = store.createRecord('vote-chain', {
            yes: [user1],
            no: [],
            remaining: [user2, user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user1.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both remaining and no', async function (assert) {
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
          firstVote.signature = await sign(
            await hash(generateSortedVote(firstVote)),
            user1.privateSigningKey
          );

          let currentVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user1, user2, user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user1.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });
      });

      module('when voter was previously no', function () {
        test('when stays no', async function (assert) {
          const store = getStore();

          let user1 = await buildUser('user1');
          let user2 = await buildUser('user2');
          let user3 = await buildUser('user3');
          let user4 = await buildUser('user4');
          let userToAdd = await buildUser('userToAdd');

          let firstVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user2, user3, user4],
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
            yes: [],
            no: [user1],
            remaining: [user2, user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user1.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });

        test('when is in both yes and remaining', async function (assert) {
          const store = getStore();

          let user1 = await buildUser('user1');
          let user2 = await buildUser('user2');
          let user3 = await buildUser('user3');
          let user4 = await buildUser('user4');
          let userToAdd = await buildUser('userToAdd');

          let firstVote = store.createRecord('vote-chain', {
            yes: [],
            no: [user1],
            remaining: [user2, user3, user4],
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
            yes: [user1],
            no: [],
            remaining: [user1, user2, user3, user4],
            action: VOTE_ACTION.ADD,
            target: userToAdd,
            key: user1,
            previousVoteChain: firstVote,
            signature: undefined,
          });
          currentVote.signature = await sign(
            await hash(generateSortedVote(currentVote)),
            user1.privateSigningKey
          );

          assert.notOk(await service.isValid(currentVote));
        });
      });

      test('when target is changed', async function (assert) {
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
        firstVote.signature = await sign(
          await hash(generateSortedVote(firstVote)),
          user1.privateSigningKey
        );

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [],
          remaining: [user3, user4],
          action: VOTE_ACTION.ADD,
          target: user3,
          key: user2,
          previousVoteChain: firstVote,
          signature: undefined,
        });
        currentVote.signature = await sign(
          await hash(generateSortedVote(currentVote)),
          user2.privateSigningKey
        );

        assert.notOk(await service.isValid(currentVote));
      });

      test('when action is changed', async function (assert) {
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
        firstVote.signature = await sign(
          await hash(generateSortedVote(firstVote)),
          user1.privateSigningKey
        );

        let currentVote = store.createRecord('vote-chain', {
          yes: [user1, user2],
          no: [],
          remaining: [user3, user4],
          action: VOTE_ACTION.PROMOTE,
          target: userToAdd,
          key: user2,
          previousVoteChain: firstVote,
          signature: undefined,
        });
        currentVote.signature = await sign(
          await hash(generateSortedVote(currentVote)),
          user2.privateSigningKey
        );

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
        firstVote.signature = await sign(
          await hash(generateSortedVote(firstVote)),
          user1.privateSigningKey
        );

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
        secondVote.signature = await sign(
          await hash(generateSortedVote(secondVote)),
          user2.privateSigningKey
        );
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
        currentVote.signature = await sign(
          await hash(generateSortedVote(currentVote)),
          user3.privateSigningKey
        );

        assert.notOk(await service.isValid(currentVote));
      });
    });
  });
});
