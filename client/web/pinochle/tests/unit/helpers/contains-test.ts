import { module, test } from 'qunit';

import { contains } from 'pinochle/helpers/contains';

module('Unit | Helper | contains', function (hooks) {
  test('it works', function (assert) {
    assert.equal(contains([[1], 1]), true);
    assert.equal(contains([[2], 1]), false);
    assert.equal(contains([[2], '2']), false, 'no coercion ');
  });
});
