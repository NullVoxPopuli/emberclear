import { module, test } from 'qunit';

import { newDeck, splitDeck } from 'pinochle/game/deck';

import type { Card } from 'pinochle/game/card';

module('Unit | Game | Deck', function () {
  module('splitDeck', function (hooks) {
    let deck: Card[];

    hooks.beforeEach(function () {
      deck = newDeck();
    });

    test('3 players have 15 cards each and a blind', function (assert) {
      let { hands, remaining } = splitDeck(deck, 3);

      assert.equal(hands.length, 3, 'has 3 hands');
      assert.equal(remaining.length, 3, 'has a blind of 3 cards');
      assert.equal(hands[0].length, 15);
      assert.equal(hands[1].length, 15);
      assert.equal(hands[2].length, 15);
    });

    test('4 players have 12 cards each', function (assert) {
      let { hands, remaining } = splitDeck(deck, 4);

      assert.equal(hands.length, 4, 'has 3 hands');
      assert.equal(remaining.length, 0, 'has no blind');
      assert.equal(hands[0].length, 12);
      assert.equal(hands[1].length, 12);
      assert.equal(hands[2].length, 12);
      assert.equal(hands[3].length, 12);
    });
  });
});
