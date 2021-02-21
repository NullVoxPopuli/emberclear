import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { GameRound } from 'pinochle/game/networking/host/game-round';

import { newCrypto } from '@emberclear/crypto/test-support';

import type { PlayerInfo } from 'pinochle/game/networking/host/types';

module('Unit | Game | Host | GameRound', function (hooks) {
  setupTest(hooks);

  module('game starts fresh', function () {
    module('with 3 players', function (hooks) {
      let players: PlayerInfo[] = [];
      let playersById: Record<string, PlayerInfo> = {};

      hooks.beforeEach(async function () {
        for (let i = 0; i < 3; i++) {
          let info = await newCrypto();

          let player = {
            id: info.hex.publicKey,
            name: `Player ${i}`,
            publicKey: info.publicKey,
            publicKeyAsHex: info.hex.publicKey,
          };

          players[i] = player;
          playersById[player.id] = player;
        }
      });

      test('can play a game', async function (assert) {
        let game = new GameRound(playersById);

        assert.equal(game.info.playerOrder.length, players.length);
        assert.ok(game.currentPlayer);
        assert.equal(game.context.hasBlind, true, 'there is a blind');
        assert.equal(game.context.blind?.length, 3, 'blind has 3 cards');
        assert.equal(game.stateForPlayer(players[0].id).hand?.length, 15);
        assert.equal(game.stateForPlayer(players[1].id).hand?.length, 15);
        assert.equal(game.stateForPlayer(players[2].id).hand?.length, 15);
        assert.equal(game.interpreter.state.value, 'bidding', 'game starts in bidding phase');
      });
    });
  });
});
