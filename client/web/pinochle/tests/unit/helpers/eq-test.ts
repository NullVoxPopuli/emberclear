import { module, test } from 'qunit';

import { eq } from 'pinochle/helpers/eq';

module('Unit | Helper | eq', function (hooks) {
  test('it works', function (assert) {
    assert.equal(eq([1, 1]), true);
    assert.equal(eq([1, '1']), false, 'no coercion');
  });
});
