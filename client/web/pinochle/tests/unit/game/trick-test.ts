import { module, test } from 'qunit';

import { Trick } from 'pinochle/game/trick';
import { Card } from 'pinochle/utils/deck';

module('Unit | Game | Trick', function () {
  module('three players', function () {
    const NUM_PLAYERS = 3;

    test('max cards may not exceed number of players', function (assert) {
      let trick = new Trick(NUM_PLAYERS);

      assert.equal(trick.points, 0);

      trick.add(new Card('diamonds', 9));

      assert.equal(trick.points, 0);

      trick.add(new Card('diamonds', 10));

      assert.equal(trick.points, 1);

      trick.add(new Card('diamonds', 'ace'));

      assert.equal(trick.points, 2);

      assert.throws(() => {
        trick.add(new Card('diamonds', 'jack'));
      });
    });
  });
  module('four players', function () {
    const NUM_PLAYERS = 4;
  });
});
