import { currentURL, settled, visit, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { JoinPage } from 'pinochle/tests/-pages/join';
import { addPlayerToHost, setupGameHost, setupPlayerTest } from 'pinochle/tests/helpers';

import { newCrypto } from '@emberclear/crypto/test-support';

import type { GameHost } from 'pinochle/game/networking/host';

module('Acceptance | join', function (hooks) {
  setupApplicationTest(hooks);
  setupPlayerTest(hooks);

  let page = new JoinPage();

  module('Has not previously joined a game', function () {
    module('there is no game', function () {
      test('visiting /join', async function (assert) {
        assert.expect(2);

        let host = await newCrypto();

        await visit(`/join/${host.hex.publicKey}`);

        assert.equal(currentURL(), `/join/${host.hex.publicKey}`);

        await waitUntil(() => page.gameNotFound.element);

        assert.dom(page.gameNotFound.element).exists();
      });
    });

    module('the game exists', function (hooks) {
      let host: GameHost;

      setupGameHost(hooks, (gameHost) => (host = gameHost));

      hooks.beforeEach(async function (assert) {
        await visit(`/join/${host.hexId}`);

        assert.dom(page.nameEntry.element).exists();
      });

      test('can join the game', async function (assert) {
        assert.expect(2);

        await page.typeName('Test Player');
        await page.submitName();

        assert.dom(page.waiting.element).exists();
      });

      module('the game starts with the current player', function (hooks) {
        hooks.beforeEach(async function (assert) {
          await addPlayerToHost(host, 'Player 1');
          await addPlayerToHost(host, 'Player 2');

          await page.typeName('Test Player');
          await page.submitName();

          assert.dom(page.waiting.element).exists();

          host.startGame();

          await settled();
        });

        test('a game can be played', async function (assert) {
          assert.equal(currentURL(), `/game/${host.hexId}`);
        });
      });

      module('The game becomes full while entering info', function (hooks) {
        hooks.beforeEach(async function () {
          await addPlayerToHost(host, 'Player 1');
          await addPlayerToHost(host, 'Player 2');
          await addPlayerToHost(host, 'Player 3');
          await addPlayerToHost(host, 'Player 4');
        });

        test('is not allowed in the game', async function (assert) {
          await page.typeName('Player 5');
          await page.submitName();

          assert.equal(currentURL(), '/game-full');
        });
      });

      module('The game has already started', function (hooks) {
        hooks.beforeEach(async function () {
          await addPlayerToHost(host, 'Player 1');
          await addPlayerToHost(host, 'Player 2');
          await addPlayerToHost(host, 'Player 3');

          host.startGame();
        });

        test('is not allowed in the game', async function (assert) {
          await page.typeName('Player 5');
          await page.submitName();

          assert.equal(currentURL(), '/not-recognized');
        });
      });
    });
  });

  module('Has a pre-existing game', function () {});
});
