import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import CryptoConnector from 'emberclear/services/workers/crypto';
import WorkersService from 'emberclear/services/workers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';

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
      let user1SigningKeys = await crypto.generateSigningKeys();
      let user1Keys = await crypto.generateKeys();
      let user1 = store.createRecord('user', {
        privateKey: user1Keys.privateKey,
        publicKey: user1Keys.publicKey,
        privateSigningKey: user1SigningKeys.privateSigningKey,
        publicSigningKey: user1SigningKeys.publicSigningKey,
      });

      let userToAddSigningKeys = await crypto.generateSigningKeys();
      let userToAddKeys = await crypto.generateKeys();
      let userToAdd = store.createRecord('user', {
        privateKey: userToAddKeys.privateKey,
        publicKey: userToAddKeys.publicKey,
        privateSigningKey: userToAddSigningKeys.privateSigningKey,
        publicSigningKey: userToAddSigningKeys.publicSigningKey,
      });

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

      let user1SigningKeys = await crypto.generateSigningKeys();
      let user1Keys = await crypto.generateKeys();
      let user1 = store.createRecord('user', {
        privateKey: user1Keys.privateKey,
        publicKey: user1Keys.publicKey,
        privateSigningKey: user1SigningKeys.privateSigningKey,
        publicSigningKey: user1SigningKeys.publicSigningKey,
      });

      let user2SigningKeys = await crypto.generateSigningKeys();
      let user2Keys = await crypto.generateKeys();
      let user2 = store.createRecord('user', {
        privateKey: user2Keys.privateKey,
        publicKey: user2Keys.publicKey,
        privateSigningKey: user2SigningKeys.privateSigningKey,
        publicSigningKey: user2SigningKeys.publicSigningKey,
      });

      let user3SigningKeys = await crypto.generateSigningKeys();
      let user3Keys = await crypto.generateKeys();
      let user3 = store.createRecord('user', {
        privateKey: user3Keys.privateKey,
        publicKey: user3Keys.publicKey,
        privateSigningKey: user3SigningKeys.privateSigningKey,
        publicSigningKey: user3SigningKeys.publicSigningKey,
      });

      let user4SigningKeys = await crypto.generateSigningKeys();
      let user4Keys = await crypto.generateKeys();
      let user4 = store.createRecord('user', {
        privateKey: user4Keys.privateKey,
        publicKey: user4Keys.publicKey,
        privateSigningKey: user4SigningKeys.privateSigningKey,
        publicSigningKey: user4SigningKeys.publicSigningKey,
      });

      let userToAddSigningKeys = await crypto.generateSigningKeys();
      let userToAddKeys = await crypto.generateKeys();
      let userToAdd = store.createRecord('user', {
        privateKey: userToAddKeys.privateKey,
        publicKey: userToAddKeys.publicKey,
        privateSigningKey: userToAddSigningKeys.privateSigningKey,
        publicSigningKey: userToAddSigningKeys.publicSigningKey,
      });

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

      let user1SigningKeys = await crypto.generateSigningKeys();
      let user1Keys = await crypto.generateKeys();
      let user1 = store.createRecord('user', {
        privateKey: user1Keys.privateKey,
        publicKey: user1Keys.publicKey,
        privateSigningKey: user1SigningKeys.privateSigningKey,
        publicSigningKey: user1SigningKeys.publicSigningKey,
      });

      let user2SigningKeys = await crypto.generateSigningKeys();
      let user2Keys = await crypto.generateKeys();
      let user2 = store.createRecord('user', {
        privateKey: user2Keys.privateKey,
        publicKey: user2Keys.publicKey,
        privateSigningKey: user2SigningKeys.privateSigningKey,
        publicSigningKey: user2SigningKeys.publicSigningKey,
      });

      let user3SigningKeys = await crypto.generateSigningKeys();
      let user3Keys = await crypto.generateKeys();
      let user3 = store.createRecord('user', {
        privateKey: user3Keys.privateKey,
        publicKey: user3Keys.publicKey,
        privateSigningKey: user3SigningKeys.privateSigningKey,
        publicSigningKey: user3SigningKeys.publicSigningKey,
      });

      let user4SigningKeys = await crypto.generateSigningKeys();
      let user4Keys = await crypto.generateKeys();
      let user4 = store.createRecord('user', {
        privateKey: user4Keys.privateKey,
        publicKey: user4Keys.publicKey,
        privateSigningKey: user4SigningKeys.privateSigningKey,
        publicSigningKey: user4SigningKeys.publicSigningKey,
      });

      let userToAddSigningKeys = await crypto.generateSigningKeys();
      let userToAddKeys = await crypto.generateKeys();
      let userToAdd = store.createRecord('user', {
        privateKey: userToAddKeys.privateKey,
        publicKey: userToAddKeys.publicKey,
        privateSigningKey: userToAddSigningKeys.privateSigningKey,
        publicSigningKey: userToAddSigningKeys.publicSigningKey,
      });

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
