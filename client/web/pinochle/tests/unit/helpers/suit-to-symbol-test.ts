import { module, test } from 'qunit';

import { NAME_MAP, suitToSymbol } from 'pinochle/helpers/suit-to-symbol';

module('Unit | Helper | suit-to-symbol', function (hooks) {
  test('it works', function (assert) {
    assert.expect(5);

    for (let [name, sym] of Object.entries(NAME_MAP)) {
      assert.equal(suitToSymbol([name]), sym);
    }

    assert.equal(suitToSymbol(['whatever']), undefined);
  });
});
