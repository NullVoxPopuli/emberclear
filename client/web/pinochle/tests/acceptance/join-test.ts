import { currentURL, settled, visit, waitUntil } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import { timeout } from 'ember-concurrency';

import { JoinPage } from 'pinochle/tests/-pages/join';
import {
  addPlayerToHost,
  clearGuests,
  clearHosts,
  setupGameHost,
  setupPlayerTest,
  stopConnectivityChecking,
} from 'pinochle/tests/helpers';

import { newCrypto } from '@emberclear/crypto/test-support';

import type { GameHost } from 'pinochle/game/networking/host';

module('Acceptance | join', function (hooks) {
  setupApplicationTest(hooks);
  setupPlayerTest(hooks);

  let page = new JoinPage();

  module('Has not previously joined a game', function () {
    module('there is no game', function () {
      skip('visiting /join', async function (assert) {
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
        await page.joinGame(host.hexId);

        assert.dom(page.nameEntry.element).exists();
      });

      test('can join the game', async function (assert) {
        assert.expect(2);

        await page.submit('Test Player');
        await waitUntil(() => page.waiting.element);
      });

      module('the game starts with the current player', function (hooks) {
        hooks.beforeEach(async function () {
          await addPlayerToHost(host, 'Player 1');
          await addPlayerToHost(host, 'Player 2');

          await page.submit('Test Player');
          await waitUntil(() => page.waiting.element);

          host.startGame();

          await page.waitFor(`/game/${host.hexId}`);
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

        test('is not allowed in the game', async function () {
          await page.submit('Player 5');
          await page.waitFor('/game-full');
        });
      });

      module('The game has already started', function (hooks) {
        hooks.beforeEach(async function () {
          await addPlayerToHost(host, 'Player 1');
          await addPlayerToHost(host, 'Player 2');
          await addPlayerToHost(host, 'Player 3');

          host.startGame();
          await settled();
        });

        test('is not allowed in the game', async function () {
          await page.submit('Player 5');
          await page.waitFor('/not-recognized');
        });
      });
    });
  });

  module('Has a pre-existing game', function (hooks) {
    let host: GameHost;
    let hostId: string;

    setupGameHost(hooks, (gameHost) => (host = gameHost));

    hooks.beforeEach(async function (assert) {
      hostId = host.hexId;

      await addPlayerToHost(host, 'Player 1');
      await addPlayerToHost(host, 'Player 2');
      assert.equal(host.players.length, 2, 'host has two players');

      await page.joinGame(hostId, 'Test Player');
      await waitUntil(() => page.waiting.element);

      host.startGame();

      await page.waitFor(`/game/${hostId}`);
      assert.equal(host.players.length, 3, 'host has three players');

      stopConnectivityChecking(hostId);

      await settled();
      await visit('/');

      clearGuests();

      await settled();
    });

    module('the host is online', function () {
      test('the player re-joins and the game is loaded', async function (assert) {
        await page.rejoin(hostId);
        assert.equal(currentURL(), `/game/${hostId}`, 'has rejoined');

        stopConnectivityChecking(hostId);

        await settled();
        assert.equal(host.players.length, 3, 'host has three players');
      });
    });

    module('the host is offline', function (hooks) {
      hooks.beforeEach(async function () {
        clearHosts();
      });

      test('the game is not loaded', async function () {
        await page.rejoin(hostId);
        await timeout(3000);
        await waitUntil(() => page.waitingForPlayers.element);
        // await page.waitFor('/not-recognized');
      });
    });
  });
});
