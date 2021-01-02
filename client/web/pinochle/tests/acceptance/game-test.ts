import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { newCrypto, setupWorkers } from '@emberclear/crypto/test-support';
import { setupSocketServer } from '@emberclear/networking/test-support';

module('Acceptance | game', function (hooks) {
  setupApplicationTest(hooks);
  setupSocketServer(hooks);
  setupWorkers(hooks);

  module('Has not previously joined a game', function () {
    module('there is no game', function () {
      test('visiting /game', async function (assert) {
        let host = await newCrypto();

        await visit(`/game/${host.hex.publicKey}`);

        assert.equal(currentURL(), `/join/${host.hex.publicKey}`);
      });
    });

    module('the game exists', function () {});
  });

  module('Has a pre-existing game', function () {});
});
