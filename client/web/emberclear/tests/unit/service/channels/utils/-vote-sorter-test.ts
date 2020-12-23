import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { generateSortedVote, VOTE_ORDERING } from 'emberclear/services/channels/-utils/vote-sorter';
import { clearLocalStorage } from 'emberclear/tests/helpers';
import { equalsUint8Array } from 'emberclear/utils/uint8array-equality';

import {
  convertObjectToUint8Array,
  convertUint8ArrayToObject,
  fromHex,
} from '@emberclear/encoding/string';
import { buildUser } from '@emberclear/local-account/test-support';
import { getStore } from '@emberclear/test-helpers/test-support';

import type { SortedVote, SortedVoteHex } from 'emberclear/services/channels/-utils/vote-sorter';

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

      let resultHex = convertUint8ArrayToObject<SortedVoteHex>(generateSortedVote(currentVote));
      let result = sortedVoteHexToSortedVote(resultHex);

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

      assert.ok(equalsUint8Array(result[VOTE_ORDERING.targetKey], currentUser.publicKey));
      assert.equal(result[VOTE_ORDERING.action], VOTE_ACTION.ADD);
      assert.ok(
        equalsUint8Array(result[VOTE_ORDERING.voterSigningKey], currentUser.publicSigningKey)
      );
      assert.ok(
        equalsUint8Array(result[VOTE_ORDERING.previousChainSignature]!, firstVote.signature)
      );
      assert.equal(result.length, 7);
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

      let resultHex = convertUint8ArrayToObject<SortedVoteHex>(generateSortedVote(currentVote));
      let result = sortedVoteHexToSortedVote(resultHex);

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

      assert.ok(equalsUint8Array(result[VOTE_ORDERING.targetKey], currentUser.publicKey));
      assert.equal(result[VOTE_ORDERING.action], VOTE_ACTION.ADD);
      assert.ok(
        equalsUint8Array(result[VOTE_ORDERING.voterSigningKey], currentUser.publicSigningKey)
      );
      assert.equal(result[VOTE_ORDERING.previousChainSignature], undefined);
      assert.equal(result.length, 7);
    });
  });
});

function sortedVoteHexToSortedVote(sortedVoteHex: SortedVoteHex): SortedVote {
  let sortedVote: SortedVote = [
    sortedVoteHex[VOTE_ORDERING.remaining].map((vote) => fromHex(vote)),
    sortedVoteHex[VOTE_ORDERING.yes].map((vote) => fromHex(vote)),
    sortedVoteHex[VOTE_ORDERING.no].map((vote) => fromHex(vote)),
    fromHex(sortedVoteHex[VOTE_ORDERING.targetKey]),
    sortedVoteHex[VOTE_ORDERING.action],
    fromHex(sortedVoteHex[VOTE_ORDERING.voterSigningKey]),
    sortedVoteHex[VOTE_ORDERING.previousChainSignature]
      ? fromHex(sortedVoteHex[VOTE_ORDERING.previousChainSignature]!)
      : undefined,
  ];

  return sortedVote;
}
