import { currentURL, find, visit, waitUntil } from '@ember/test-helpers';
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
        assert.expect(2);

        let host = await newCrypto();

        await visit(`/game/${host.hex.publicKey}`);

        assert.equal(currentURL(), `/join/${host.hex.publicKey}`);

        assert.dom().containsText('Connecting...');

        await waitUntil(() => find('*')?.textContent?.includes('Game does not exist'), {
          timeout: 10000,
        });
      });
    });
  });

  module('Has a pre-existing game', function () {});
});
