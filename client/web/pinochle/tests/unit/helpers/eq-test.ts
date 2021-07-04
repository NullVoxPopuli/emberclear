import { module, test } from 'qunit';

import { eq } from 'pinochle/helpers/eq';

module('Unit | Helper | eq', function () {
  test('it works', function (assert) {
    assert.true(eq([1, 1]));
    assert.false(eq([1, '1']), 'no coercion');
  });
});
