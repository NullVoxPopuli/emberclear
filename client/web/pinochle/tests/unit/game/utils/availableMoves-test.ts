import { module, test } from 'qunit';

import { Card } from 'pinochle/game/card';
import { Trick } from 'pinochle/game/trick';
import { availableMoves } from 'pinochle/game/utils/move-validation';

const diamonds = {
  9: new Card('diamonds', 9),
  jack: new Card('diamonds', 'jack'),
  queen: new Card('diamonds', 'queen'),
  king: new Card('diamonds', 'king'),
  10: new Card('diamonds', 10),
  ace: new Card('diamonds', 'ace'),
};
const clubs = {
  9: new Card('clubs', 9),
  jack: new Card('clubs', 'jack'),
  queen: new Card('clubs', 'queen'),
  king: new Card('clubs', 'king'),
  10: new Card('clubs', 10),
  ace: new Card('clubs', 'ace'),
};
const spades = {
  9: new Card('spades', 9),
  jack: new Card('spades', 'jack'),
  queen: new Card('spades', 'queen'),
  king: new Card('spades', 'king'),
  10: new Card('spades', 10),
  ace: new Card('spades', 'ace'),
};
const hearts = {
  9: new Card('hearts', 9),
  jack: new Card('hearts', 'jack'),
  queen: new Card('hearts', 'queen'),
  king: new Card('hearts', 'king'),
  10: new Card('hearts', 10),
  ace: new Card('hearts', 'ace'),
};

module('Unit | Game | Utils | availableMoves', function () {
  const hand = [
    hearts[9],
    hearts.jack,
    hearts.queen,
    hearts.king,
    hearts[10],
    hearts.ace,
    clubs.ace,
    clubs.king,
    spades[9],
    spades.jack,
    spades.queen,
  ];

  test('must play a trump card', function (assert) {
    let trick = new Trick(3);

    trick.add(diamonds.queen);

    assert.deepEqual(availableMoves(trick, hand, 'clubs'), [clubs.ace, clubs.king]);
  });

  test('must play a higher card', async function (assert) {
    let trick = new Trick(3);

    trick.add(new Card('hearts', 'queen'));

    assert.deepEqual(availableMoves(trick, hand, 'clubs'), [
      hearts.queen,
      hearts.king,
      hearts[10],
      hearts.ace,
    ]);
  });

  test('when there is no trump remaining', function (assert) {
    let trick = new Trick(3);

    trick.add(new Card('diamonds', 'queen'));

    assert.deepEqual(availableMoves(trick, hand, 'diamonds'), hand);
  });
});
