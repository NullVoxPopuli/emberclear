import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { clearLocalStorage, getStore } from 'emberclear/tests/helpers';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote, VOTE_ORDERING } from 'emberclear/services/channels/-utils/vote-sorter';
import {
  convertObjectToUint8Array,
  convertUint8ArrayToObject,
} from 'emberclear/utils/string-encoding';
import { buildUser } from 'emberclear/tests/helpers/factories/user-factory';

module('Unit | Service | channels/utils/vote-sorter', function (hooks) {
  setupTest(hooks);
  clearLocalStorage(hooks);

  module('vote is sorted properly', function () {
    test('when ran with previous vote', async function (assert) {
      const store = getStore();
      let yes1 = await buildUser('yes1');
      let yes2 = await buildUser('yes2');
      let no1 = await buildUser('no1');
      let no2 = await buildUser('no2');
      let remaining1 = await buildUser('remaining1');
      let remaining2 = await buildUser('remaining2');
      let currentUser = await buildUser('currentUser');
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
        ),
        'ensure remaining keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.yes].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ),
        'ensure yes keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.no].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ),
        'ensure no keys are sorted'
      );

      assert.ok(keyEquals(result[VOTE_ORDERING.targetKey], currentUser.publicKey));
      assert.equal(result[VOTE_ORDERING.action], VOTE_ACTION.ADD);
      assert.ok(keyEquals(result[VOTE_ORDERING.voterSigningKey], currentUser.publicSigningKey));
      assert.ok(keyEquals(result[VOTE_ORDERING.previousChainSignature], firstVote.signature));
      assert.equal(Object.keys(result).length, 7);
    });

    test('when ran without previous vote', async function (assert) {
      const store = getStore();
      let yes1 = await buildUser('yes1');
      let yes2 = await buildUser('yes2');
      let no1 = await buildUser('no1');
      let no2 = await buildUser('no2');
      let remaining1 = await buildUser('remaining1');
      let remaining2 = await buildUser('remaining2');
      let currentUser = await buildUser('currentUser');
      let currentVote = store.createRecord('vote-chain', {
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
        ),
        'ensure remaining keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.yes].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ),
        'ensure yes keys are sorted'
      );
      assert.ok(
        result[VOTE_ORDERING.no].every(
          (current: Uint8Array, index: number, array: Uint8Array[]) =>
            !index || array[index - 1] <= current
        ),
        'ensure no keys are sorted'
      );

      assert.ok(keyEquals(result[VOTE_ORDERING.targetKey], currentUser.publicKey));
      assert.equal(result[VOTE_ORDERING.action], VOTE_ACTION.ADD);
      assert.ok(keyEquals(result[VOTE_ORDERING.voterSigningKey], currentUser.publicSigningKey));
      assert.equal(result[VOTE_ORDERING.previousChainSignature], undefined);
      assert.equal(Object.keys(result).length, 7);
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
