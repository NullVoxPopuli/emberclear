import { module, test } from 'qunit';

import { Card } from 'pinochle/game/card';
import { Trick } from 'pinochle/game/trick';
import { isValidMove } from 'pinochle/game/utils/move-validation';

module('Unit | Game | Utils | isValidMove', function () {
  test('anything goes when the trick is empty', function (assert) {
    let trick = new Trick(3);

    assert.ok(isValidMove(trick, new Card('clubs', 9), 'diamonds'));
  });

  test('must match suit', function (assert) {
    let trick = new Trick(3);

    trick.add(new Card('clubs', 9));

    assert.ok(isValidMove(trick, new Card('clubs', 'queen'), 'diamonds'));
  });

  test('can be equal', function (assert) {
    let trick = new Trick(3);

    trick.add(new Card('clubs', 9));

    assert.ok(isValidMove(trick, new Card('clubs', 9), 'diamonds'));
  });

  test('cannot be less than', function (assert) {
    let trick = new Trick(3);

    trick.add(new Card('clubs', 10));

    assert.notOk(isValidMove(trick, new Card('clubs', 9), 'diamonds'));
  });
});
