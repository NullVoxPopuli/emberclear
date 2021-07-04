import Ember from 'ember';
import { module, skip, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { GameRound } from 'pinochle/game/networking/host/game-round';
import { Trick } from 'pinochle/game/trick';
import { availableMoves } from 'pinochle/game/utils/move-validation';

import { newCrypto } from '@emberclear/crypto/test-support';

import type { PlayerInfo } from 'pinochle/game/networking/host/types';

function debugAssert(str: string, cond: unknown): asserts cond {
  // eslint-disable-next-line ember/new-module-imports
  return Ember.assert(str, cond);
}

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

      skip('can play a game', async function (assert) {
        let game = new GameRound(playersById);
        let ctx = game.context;
        let currentPlayer = game.currentPlayer;
        let playerOrder = ctx.playerOrder;

        assert.equal(game.info.playerOrder.length, players.length);
        assert.ok(currentPlayer);
        assert.equal(ctx.currentPlayer, playerOrder[0], `it is player 1's turn`);
        assert.equal(ctx.hasBlind, true, 'there is a blind');
        assert.equal(ctx.blind?.length, 3, 'blind has 3 cards');
        assert.equal(ctx.playersById[players[0].id].hand?.length, 15);
        assert.equal(ctx.playersById[players[1].id].hand?.length, 15);
        assert.equal(ctx.playersById[players[2].id].hand?.length, 15);
        assert.equal(game.interpreter.state.value, 'bidding', 'game starts in bidding phase');

        game.bid({ bid: 15 });

        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 1);
        assert.deepEqual(Object.values(ctx.bids), [15]);
        assert.equal(ctx.currentPlayer, playerOrder[1], `it is player 2's turn`);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 16 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 2);
        assert.deepEqual(Object.values(ctx.bids), [15, 16]);
        assert.equal(ctx.currentPlayer, playerOrder[2], `it is player 3's turn`);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 17 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 3);
        assert.deepEqual(Object.values(ctx.bids), [15, 16, 17]);
        assert.equal(ctx.currentPlayer, playerOrder[0], `it is player 1's turn`);
        assert.equal(ctx.bids[ctx.currentPlayer], 15);
        assert.equal(game.interpreter.state.value, 'bidding');

        // game.bid({ bid: 'passed' });
        game.interpreter.send('PASS');
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 3);
        assert.deepEqual(Object.values(ctx.bids), ['passed', 16, 17]);
        assert.equal(ctx.currentPlayer, playerOrder[1], `it is player 2's turn`);
        assert.equal(ctx.bids[ctx.currentPlayer], 16);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 18 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 3);
        assert.deepEqual(Object.values(ctx.bids), ['passed', 18, 17]);
        assert.equal(ctx.currentPlayer, playerOrder[2], `it is player 3's turn`);
        assert.equal(ctx.bids[ctx.currentPlayer], 17);
        assert.equal(game.interpreter.state.value, 'bidding');

        // game.bid({ bid: 'passed' });
        game.interpreter.send('PASS');
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 3);
        assert.deepEqual(Object.values(ctx.bids), ['passed', 18, 'passed']);
        assert.equal(ctx.bids[ctx.currentPlayer], 18);
        assert.equal(
          ctx.currentPlayer,
          playerOrder[1],
          `it is player 2's turn, player 1 was skipped due to passing earlier in the bidding phase`
        );
        assert.deepEqual(game.interpreter.state.value, { 'won-bid': 'pending-acceptance' });

        game.interpreter.send('ACCEPT');

        assert.deepEqual(game.interpreter.state.value, { 'won-bid': 'accepted' });

        game.interpreter.send({ type: 'DECLARE_TRUMP', trump: 'clubs' });

        assert.deepEqual(game.interpreter.state.value, { 'won-bid': 'discard' });

        game.interpreter.send({ type: 'DISCARD', cards: [] });

        assert.deepEqual(game.interpreter.state.value, 'declare-meld');

        // async, not dependent on turn order
        game.interpreter.send({ type: 'SUBMIT_MELD', player: players[0].id });
        game.interpreter.send({ type: 'SUBMIT_MELD', player: players[1].id });
        game.interpreter.send({ type: 'SUBMIT_MELD', player: players[2].id });

        // async, not dependent on turn order
        game.interpreter.send({ type: 'READY', player: players[0].id });
        game.interpreter.send({ type: 'READY', player: players[1].id });
        game.interpreter.send({ type: 'READY', player: players[2].id });

        // there are 15 rounds of trick taking in a 3 player game
        let trump = game.context.trump;

        debugAssert('expected trump to exist', trump);

        for (let trick = 0; trick < 15; trick++) {
          for (let player = 0; player < players.length; player++) {
            let trickCards = game.context.trick;

            debugAssert('expected trick to exist', trickCards);

            let trick = Trick.from(trickCards);

            let hand = game.context.playersById[game.context.currentPlayer].hand;
            let validMoves = availableMoves(trick, hand, trump);
            let card = validMoves[0];

            game.interpreter.send({ type: 'PLAY_CARD', card });
          }
        }

        assert.equal(game.interpreter.state.value, 'end-game');
      });
    });

    module('with 4 players', function (hooks) {
      let players: PlayerInfo[] = [];
      let playersById: Record<string, PlayerInfo> = {};

      hooks.beforeEach(async function () {
        for (let i = 0; i < 4; i++) {
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
        let ctx = game.context;
        let currentPlayer = game.currentPlayer;
        let playerOrder = ctx.playerOrder;

        assert.equal(game.info.playerOrder.length, players.length);
        assert.ok(currentPlayer);
        assert.equal(ctx.currentPlayer, playerOrder[0], `it is player 1's turn`);
        assert.false(ctx.hasBlind, 'no blind');
        assert.equal(ctx.blind?.length, 0, 'no blind');
        assert.equal(ctx.playersById[players[0].id].hand?.length, 12);
        assert.equal(ctx.playersById[players[1].id].hand?.length, 12);
        assert.equal(ctx.playersById[players[2].id].hand?.length, 12);
        assert.equal(ctx.playersById[players[3].id].hand?.length, 12);
        assert.equal(game.interpreter.state.value, 'bidding', 'game starts in bidding phase');

        game.bid({ bid: 15 });

        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 1);
        assert.deepEqual(Object.values(ctx.bids), [15]);
        assert.equal(ctx.currentPlayer, playerOrder[1], `it is player 2's turn`);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 16 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 2);
        assert.deepEqual(Object.values(ctx.bids), [15, 16]);
        assert.equal(ctx.currentPlayer, playerOrder[2], `it is player 3's turn`);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 17 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 3);
        assert.deepEqual(Object.values(ctx.bids), [15, 16, 17]);
        assert.equal(ctx.currentPlayer, playerOrder[3], `it is player 4's turn`);
        assert.equal(game.interpreter.state.value, 'bidding');

        // game.bid({ bid: 'passed' });
        game.interpreter.send('PASS');
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 4);
        assert.deepEqual(Object.values(ctx.bids), [15, 16, 17, 'passed']);
        assert.equal(ctx.currentPlayer, playerOrder[0], `it is player 1's turn`);
        assert.equal(ctx.bids[ctx.currentPlayer], 15);
        assert.equal(game.interpreter.state.value, 'bidding');

        game.bid({ bid: 18 });
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 4);
        assert.deepEqual(Object.values(ctx.bids), [18, 16, 17, 'passed']);
        assert.equal(ctx.currentPlayer, playerOrder[1], `it is player 2's turn`);
        assert.equal(ctx.bids[ctx.currentPlayer], 16);
        assert.equal(game.interpreter.state.value, 'bidding');

        // game.bid({ bid: 'passed' });
        game.interpreter.send('PASS');
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 4);
        assert.deepEqual(Object.values(ctx.bids), [18, 'passed', 17, 'passed']);
        assert.equal(ctx.bids[ctx.currentPlayer], 17);
        assert.equal(game.interpreter.state.value, 'bidding');

        // game.bid({ bid: 'passed' });
        game.interpreter.send('PASS');
        ctx = game.context;

        assert.equal(Object.keys(ctx.bids).length, 4);
        assert.deepEqual(Object.values(ctx.bids), [18, 'passed', 'passed', 'passed']);
        assert.equal(ctx.bids[ctx.currentPlayer], 18);
        assert.deepEqual(game.interpreter.state.value, { 'won-bid': 'pending-acceptance' });
        assert.equal(
          ctx.currentPlayer,
          playerOrder[0],
          `it is player 1's turn, player 3 and 4 were skipped due to passing earlier in the bidding phase`
        );
      });
    });
  });
});
