import { currentURL, visit, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { JoinPage } from 'pinochle/tests/-pages/join';
import { addPlayerToHost, setupGameHost } from 'pinochle/tests/helpers';

import { newCrypto, setupWorkers } from '@emberclear/crypto/test-support';
import { setupSocketServer } from '@emberclear/networking/test-support';

import type { GameGuest } from 'pinochle/game/networking/guest';
import type { GameHost } from 'pinochle/game/networking/host';

module('Acceptance | join', function (hooks) {
  setupApplicationTest(hooks);
  setupSocketServer(hooks);
  setupWorkers(hooks);

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

      module('The game becomes full while entering info', function (hooks) {
        let players: GameGuest[];

        hooks.beforeEach(async function () {
          players = [
            await addPlayerToHost(host, 'Player 1'),
            await addPlayerToHost(host, 'Player 2'),
            await addPlayerToHost(host, 'Player 3'),
            await addPlayerToHost(host, 'Player 4'),
          ];
        });

        hooks.afterEach(function () {
          players.map((player) => player.disconnect());
        });

        test('is not allowed in the game', async function (assert) {
          await page.typeName('Player 5');
          await page.submitName();

          assert.equal(currentURL(), '/game-full');
        });
      });

      module('The game has already started', function (hooks) {
        let players: GameGuest[];

        hooks.beforeEach(async function () {
          players = [
            await addPlayerToHost(host, 'Player 1'),
            await addPlayerToHost(host, 'Player 2'),
            await addPlayerToHost(host, 'Player 3'),
          ];

          await host.startGame();
        });

        hooks.afterEach(function () {
          players.map((player) => player.disconnect());
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
