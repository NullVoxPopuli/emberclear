import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import CryptoConnector from 'emberclear/services/workers/crypto';
import WorkersService from 'emberclear/services/workers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';

module('Unit | Service | channels/vote-verifier', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: VoteVerifier;
  let workers!: WorkersService;
  let crypto!: CryptoConnector;

  hooks.beforeEach(function () {
    service = getService('channels/vote-verifier');
    workers = getService('workers');
    crypto = new CryptoConnector({
      workerService: workers,
    });
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
      currentVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(currentVote)),
        user1.privateSigningKey
      );

      assert.ok(await service.verify(currentVote));
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
      firstVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(firstVote)),
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
      secondVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(secondVote)),
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
      currentVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(currentVote)),
        user3.privateSigningKey
      );

      assert.ok(await service.verify(currentVote));
    });
  });

  module('vote is not valid', function () {
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
      firstVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(firstVote)),
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
      secondVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(secondVote)),
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
      currentVote.signature = await crypto.sign(
        await crypto.hash(generateSortedVote(currentVote)),
        user3.privateSigningKey
      );

      assert.notOk(await service.verify(currentVote));
    });
  });
});
