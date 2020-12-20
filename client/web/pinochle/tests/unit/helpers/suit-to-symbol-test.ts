import { module, test } from 'qunit';

import { NAME_MAP, suitToSymbol } from 'pinochle/helpers/suit-to-symbol';

import type { Suit } from 'pinochle/game/card';

module('Unit | Helper | suit-to-symbol', function () {
  test('it works', function (assert) {
    assert.expect(5);

    for (let [name, sym] of Object.entries(NAME_MAP)) {
      assert.equal(suitToSymbol(name as LIES<Suit>), sym);
    }

    assert.equal(suitToSymbol('whatever' as LIES<Suit>), undefined);
  });
});
