import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getStore } from 'emberclear/tests/helpers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote, VOTE_ORDERING } from 'emberclear/services/channels/-utils/vote-sorter';
import {
  convertObjectToUint8Array,
  convertUint8ArrayToObject,
} from 'emberclear/utils/string-encoding';

module('Unit | Service | channels/utils/vote-sorter', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  module('vote is sorted properly', function () {
    test('when ran', function (assert) {
      const store = getStore();
      let yes1 = store.createRecord('identity', {
        publicKey: new Uint8Array([21, 32]),
      });
      let yes2 = store.createRecord('identity', {
        publicKey: new Uint8Array([11, 7]),
      });
      let no1 = store.createRecord('identity', {
        publicKey: new Uint8Array([47, 75]),
      });
      let no2 = store.createRecord('identity', {
        publicKey: new Uint8Array([32, 19]),
      });
      let remaining1 = store.createRecord('identity', {
        publicKey: new Uint8Array([54, 32]),
      });
      let remaining2 = store.createRecord('identity', {
        publicKey: new Uint8Array([20, 98]),
      });
      let currentUser = store.createRecord('identity', {
        publicKey: convertObjectToUint8Array('key'),
        publicSigningKey: convertObjectToUint8Array('signingKey'),
      });
      let firstVote = store.createRecord('vote-chain', {
        signature: convertObjectToUint8Array('firstVoteSignature'),
      });
      let currentVote = store.createRecord('vote-chain', {
        previousVoteChain: firstVote,
        action: VOTE_ACTION.ADD,
        key: currentUser,
        target: currentUser,
        yes: [yes1, yes2],
        no: [no1, no2],
        remaining: [remaining2, remaining1],
      });

      let result = convertUint8ArrayToObject(generateSortedVote(currentVote));
      assert.ok(
        result[VOTE_ORDERING.remaining].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ), 'ensure remaining keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.yes].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ), 'ensure yes keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.no].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ), 'ensure no keys are sorted'
      );

      assert.ok(keyEquals(result[VOTE_ORDERING.targetKey], currentUser.publicKey));
      assert.equal(result[VOTE_ORDERING.action], VOTE_ACTION.ADD);
      assert.ok(keyEquals(result[VOTE_ORDERING.voterSigningKey], currentUser.publicSigningKey));
      assert.ok(keyEquals(result[VOTE_ORDERING.previousChainSignature], firstVote.signature));
    });
  });
});

function keyEquals(arr: number[], uint8array: Uint8Array): boolean {
  if (Object.keys(arr).length !== uint8array.length) {
    return false;
  }

  for (let i = 0; i < uint8array.length; i++) {
    if (arr[i] !== uint8array[i]) {
      return false;
    }
  }

  return true;
}
