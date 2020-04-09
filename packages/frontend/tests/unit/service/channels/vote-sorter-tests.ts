import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteSorter from 'emberclear/services/channels/vote-sorter';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';

module('Unit | Service | channels/vote-sorter', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  let service!: VoteSorter;

  hooks.beforeEach(function () {
    service = getService('channels/vote-sorter');
  });

  test('it exists', function (assert) {
    assert.ok(service);
  });

  module('vote is sorted properly', function (hooks) {
    test('when remaining, yes, and no are out of order', function (assert) {
        let expectedString = '';
        const store = getStore();
        let currentVote = store.createRecord('vote-chain');
        let firstVote = store.createRecord('vote-chain');
        let firstVoteSignature = new TextEncoder().encode('firstVoteSignature');
        let currentVoteSigningKey = new TextEncoder().encode('signingKey');
        let currentVoteKey = new TextEncoder().encode('key');
        firstVote.signature = firstVoteSignature;
        currentVote.previousVoteChain = firstVote;
        currentVote.action = VOTE_ACTION.ADD;
        currentVote.key.publicSigningKey = currentVoteSigningKey;
        currentVote.target.publicKey = currentVoteKey;
    });
  });
});
