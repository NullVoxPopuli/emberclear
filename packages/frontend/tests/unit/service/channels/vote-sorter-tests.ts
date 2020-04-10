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
    test('when ran', function (assert) {
        const store = getStore();
        let currentVote = store.createRecord('vote-chain');
        let firstVote = store.createRecord('vote-chain');
        let yes1 = store.createRecord('identity');
        let yes2 = store.createRecord('identity');
        let no1 = store.createRecord('identity');
        let no2 = store.createRecord('identity');
        let remaining1 = store.createRecord('identity');
        let remaining2 = store.createRecord('identity');
        let currentUser = store.createRecord('identity');
        let firstVoteSignature = new TextEncoder().encode('firstVoteSignature');
        let currentVoteSigningKey = new TextEncoder().encode('signingKey');
        let currentVoteKey = new TextEncoder().encode('key');
        currentUser.publicKey = currentVoteKey;
        currentUser.publicSigningKey = currentVoteSigningKey;
        firstVote.signature = firstVoteSignature;
        currentVote.previousVoteChain = firstVote;
        currentVote.action = VOTE_ACTION.ADD;
        currentVote.key = currentUser;
        currentVote.target = currentUser;
        yes1.publicKey = new Uint8Array([21, 32]);
        yes2.publicKey = new Uint8Array([11, 7]);
        no1.publicKey = new Uint8Array([47, 75]);
        no2.publicKey = new Uint8Array([32, 19]);
        remaining1.publicKey = new Uint8Array([54, 32]);
        remaining2.publicKey = new Uint8Array([20, 98]);
        currentVote.yes.push(yes1);
        currentVote.yes.push(yes2);
        currentVote.no.push(no1);
        currentVote.no.push(no2);
        currentVote.remaining.push(remaining1);
        currentVote.remaining.push(remaining2);

        let result = JSON.parse(new TextDecoder().decode(service.generateSortedVote(currentVote)));
        assert.ok(result[0].every((current: Uint8Array, index: number,array: Uint8Array[]) => !index || array[index-1] <= current));
        assert.ok(result[1].every((current: Uint8Array, index: number,array: Uint8Array[]) => !index || array[index-1] <= current));
        assert.ok(result[2].every((current: Uint8Array, index: number,array: Uint8Array[]) => !index || array[index-1] <= current));
        assert.equal(result[3], currentVoteKey);
        assert.equal(result[4], VOTE_ACTION.ADD);
        assert.equal(result[5], currentVoteSigningKey);
        assert.equal(result[6], firstVoteSignature);
    });
  });
});
