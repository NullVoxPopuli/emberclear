import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import td from 'testdouble';

import { clearLocalStorage, getService, getStore } from 'emberclear/tests/helpers';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';

module('Unit | Service | channels/vote-verifier', function (hooks) {
    setupTest(hooks);
    clearLocalStorage(hooks);

    let service!: VoteVerifier;

    hooks.beforeEach(function () {
        service = getService('channels/vote-verifier');
    })

    test('it exists', function(assert) {
        assert.ok(service);
    })

    module('vote is valid', function (hooks) {
        test('when only one chain', async function(assert) {
            const store = getStore();
            let currentVote = store.createRecord('vote-chain');
            assert.ok(await service.verify(currentVote));
        });

        test('when there are many chains', async function(assert) {
            const store = getStore();
            let currentVote = store.createRecord('vote-chain');
            let secondVote = store.createRecord('vote-chain');
            let firstVote = store.createRecord('vote-chain');
            currentVote.previousVoteChain = secondVote;
            secondVote.previousVoteChain = firstVote;
            firstVote.yes = [];
            firstVote.no = [];
            firstVote.remaining = [];
        });
    });
});