import { currentURL, visit, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { JoinPage } from 'pinochle/tests/-pages/join';

import { newCrypto, setupWorkers } from '@emberclear/crypto/test-support';
import { setupSocketServer } from '@emberclear/networking/test-support';
import { getService } from '@emberclear/test-helpers/test-support';

import type { GameHost } from 'pinochle/game/networking/host';

module('Acceptance | join', function (hooks) {
  setupApplicationTest(hooks);
  setupSocketServer(hooks);
  setupWorkers(hooks);

  let page = new JoinPage();

  module('Has not previously joined a game', function () {
    module('there is no game', function () {
      test('visiting /join', async function (assert) {
        assert.expect(4);

        let host = await newCrypto();

        await visit(`/join/${host.hex.publicKey}`);

        assert.equal(currentURL(), `/join/${host.hex.publicKey}`);
        assert.dom(page.gameNotFound.element).doesNotExist();
        assert.dom(page.connecting.element).exists();

        await waitUntil(() => page.gameNotFound.element);

        assert.dom(page.gameNotFound.element).exists();
      });
    });

    module('the game exists', function (hooks) {
      let host: GameHost;

      hooks.beforeEach(async function (assert) {
        let gameManager = getService('game-manager');

        host = await gameManager.createHost();
        host.shouldCheckConnectivity = false;

        await visit(`/join/${host.hexId}`);

        assert.dom(page.nameEntry.element).exists();
      });
      hooks.afterEach(function () {
        host.disconnect();
      });

      test('can join the game', async function (assert) {
        assert.expect(2);

        await page.typeName('Test Player');
        await page.submitName();

        assert.dom(page.waiting.element).exists();
      });
    });
  });

  module('Has a pre-existing game', function () {});
});
