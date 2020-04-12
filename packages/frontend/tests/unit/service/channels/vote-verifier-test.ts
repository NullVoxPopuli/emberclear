import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import CryptoConnector from 'emberclear/services/workers/crypto';
import WorkersService from 'emberclear/services/workers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import VoteSorter from 'emberclear/services/channels/vote-sorter';

module('Unit | Service | channels/vote-verifier', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: VoteVerifier;
  let workers!: WorkersService;
  let voteSorter!: VoteSorter;
  let crypto!: CryptoConnector;

  hooks.beforeEach(function () {
    service = getService('channels/vote-verifier');
    workers = getService('workers');
    voteSorter = getService('channels/vote-sorter');
    crypto = new CryptoConnector({
      workerService: workers,
    });
  });

  test('it exists', function (assert) {
    assert.ok(service);
  });

  module('vote is valid', function (hooks) {
    test('when only one chain', async function (assert) {
      const store = getStore();
      let currentVote = store.createRecord('vote-chain');
      assert.ok(await service.verify(currentVote));
    });

    test('when there are many chains', async function (assert) {
      const store = getStore();

      let currentVote = store.createRecord('vote-chain');
      let secondVote = store.createRecord('vote-chain');
      let firstVote = store.createRecord('vote-chain');
      let user1 = store.createRecord('user');
      let user2 = store.createRecord('user');
      let user3 = store.createRecord('user');
      let user4 = store.createRecord('user');
      let userToAdd = store.createRecord('user');

      let user1SigningKeys = await crypto.generateSigningKeys();
      let user1Keys = await crypto.generateKeys();
      user1.privateSigningKey = user1SigningKeys.privateSigningKey;
      user1.publicSigningKey = user1SigningKeys.publicSigningKey;
      user1.privateKey = user1Keys.privateKey;
      user1.publicKey = user1Keys.publicKey;

      let user2SigningKeys = await crypto.generateSigningKeys();
      let user2Keys = await crypto.generateKeys();
      user2.privateSigningKey = user2SigningKeys.privateSigningKey;
      user2.publicSigningKey = user2SigningKeys.publicSigningKey;
      user2.privateKey = user2Keys.privateKey;
      user2.publicKey = user2Keys.publicKey;

      let user3SigningKeys = await crypto.generateSigningKeys();
      let user3Keys = await crypto.generateKeys();
      user3.privateSigningKey = user3SigningKeys.privateSigningKey;
      user3.publicSigningKey = user3SigningKeys.publicSigningKey;
      user3.privateKey = user3Keys.privateKey;
      user3.publicKey = user3Keys.publicKey;

      let user4SigningKeys = await crypto.generateSigningKeys();
      let user4Keys = await crypto.generateKeys();
      user4.privateSigningKey = user4SigningKeys.privateSigningKey;
      user4.publicSigningKey = user4SigningKeys.publicSigningKey;
      user4.privateKey = user4Keys.privateKey;
      user4.publicKey = user4Keys.publicKey;

      let userToAddSigningKeys = await crypto.generateSigningKeys();
      let userToAddKeys = await crypto.generateKeys();
      userToAdd.privateSigningKey = userToAddSigningKeys.privateSigningKey;
      userToAdd.publicSigningKey = userToAddSigningKeys.publicSigningKey;
      userToAdd.privateKey = userToAddKeys.privateKey;
      userToAdd.publicKey = userToAddKeys.publicKey;

      firstVote.yes = [user1];
      firstVote.no = [];
      firstVote.remaining = [user2, user3, user4];
      firstVote.action = VOTE_ACTION.ADD;
      firstVote.target = userToAdd;
      firstVote.key = user1;
      firstVote.previousVoteChain = undefined;
      firstVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(firstVote)),
        user1.privateSigningKey
      );

      secondVote.yes = [user1, user2];
      secondVote.no = [];
      secondVote.remaining = [user3, user4];
      secondVote.action = VOTE_ACTION.ADD;
      secondVote.target = userToAdd;
      secondVote.key = user2;
      secondVote.previousVoteChain = firstVote;
      secondVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(secondVote)),
        user2.privateSigningKey
      );

      currentVote.yes = [user1, user2];
      currentVote.no = [user3];
      currentVote.remaining = [user4];
      currentVote.action = VOTE_ACTION.ADD;
      currentVote.target = userToAdd;
      currentVote.key = user3;
      currentVote.previousVoteChain = secondVote;
      currentVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(currentVote)),
        user3.privateSigningKey
      );

      assert.ok(await service.verify(currentVote));
    });
  });

  module('vote is not valid', function (hooks) {
    test('when there are many chains', async function (assert) {
      const store = getStore();

      let currentVote = store.createRecord('vote-chain');
      let secondVote = store.createRecord('vote-chain');
      let firstVote = store.createRecord('vote-chain');
      let user1 = store.createRecord('user');
      let user2 = store.createRecord('user');
      let user3 = store.createRecord('user');
      let user4 = store.createRecord('user');
      let userToAdd = store.createRecord('user');

      let user1SigningKeys = await crypto.generateSigningKeys();
      let user1Keys = await crypto.generateKeys();
      user1.privateSigningKey = user1SigningKeys.privateSigningKey;
      user1.publicSigningKey = user1SigningKeys.publicSigningKey;
      user1.privateKey = user1Keys.privateKey;
      user1.publicKey = user1Keys.publicKey;

      let user2SigningKeys = await crypto.generateSigningKeys();
      let user2Keys = await crypto.generateKeys();
      user2.privateSigningKey = user2SigningKeys.privateSigningKey;
      user2.publicSigningKey = user2SigningKeys.publicSigningKey;
      user2.privateKey = user2Keys.privateKey;
      user2.publicKey = user2Keys.publicKey;

      let user3SigningKeys = await crypto.generateSigningKeys();
      let user3Keys = await crypto.generateKeys();
      user3.privateSigningKey = user3SigningKeys.privateSigningKey;
      user3.publicSigningKey = user3SigningKeys.publicSigningKey;
      user3.privateKey = user3Keys.privateKey;
      user3.publicKey = user3Keys.publicKey;

      let user4SigningKeys = await crypto.generateSigningKeys();
      let user4Keys = await crypto.generateKeys();
      user4.privateSigningKey = user4SigningKeys.privateSigningKey;
      user4.publicSigningKey = user4SigningKeys.publicSigningKey;
      user4.privateKey = user4Keys.privateKey;
      user4.publicKey = user4Keys.publicKey;

      let userToAddSigningKeys = await crypto.generateSigningKeys();
      let userToAddKeys = await crypto.generateKeys();
      userToAdd.privateSigningKey = userToAddSigningKeys.privateSigningKey;
      userToAdd.publicSigningKey = userToAddSigningKeys.publicSigningKey;
      userToAdd.privateKey = userToAddKeys.privateKey;
      userToAdd.publicKey = userToAddKeys.publicKey;

      firstVote.yes = [user1];
      firstVote.no = [];
      firstVote.remaining = [user2, user3, user4];
      firstVote.action = VOTE_ACTION.ADD;
      firstVote.target = userToAdd;
      firstVote.key = user1;
      firstVote.previousVoteChain = undefined;
      firstVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(firstVote)),
        user1.privateSigningKey
      );

      secondVote.yes = [user1, user2];
      secondVote.no = [];
      secondVote.remaining = [user3, user4];
      secondVote.action = VOTE_ACTION.ADD;
      secondVote.target = userToAdd;
      secondVote.key = user2;
      secondVote.previousVoteChain = firstVote;
      secondVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(secondVote)),
        user2.privateSigningKey
      );
      secondVote.no = [user4];
      secondVote.remaining = [user3];

      currentVote.yes = [user1, user2];
      currentVote.no = [user3, user4];
      currentVote.remaining = [];
      currentVote.action = VOTE_ACTION.ADD;
      currentVote.target = userToAdd;
      currentVote.key = user3;
      currentVote.previousVoteChain = secondVote;
      currentVote.signature = await crypto.sign(
        await crypto.hash(voteSorter.generateSortedVote(currentVote)),
        user3.privateSigningKey
      );

      assert.notOk(await service.verify(currentVote));
    });
  });
});
