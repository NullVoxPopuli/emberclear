import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getStore } from 'emberclear/tests/helpers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote } from 'emberclear/services/channels/-utils/vote-sorter';
import {
  convertObjectToUint8Array,
  convertUint8ArrayToObject,
} from 'emberclear/utils/string-encoding';
import { equalsUint8Array } from 'emberclear/utils/uint8array-equality';

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
        result[0].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        )
      );
      assert.ok(
        result[1].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        )
      );
      assert.ok(
        result[2].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        )
      );

      assert.ok(equalsUint8Array(result[3], currentUser.publicKey));
      assert.equal(result[4], VOTE_ACTION.ADD);
      assert.ok(equalsUint8Array(result[5], currentUser.publicSigningKey));
      assert.ok(equalsUint8Array(result[6], firstVote.signature));
    });
  });
});
