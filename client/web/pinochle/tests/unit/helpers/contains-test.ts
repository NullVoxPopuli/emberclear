import { module, test } from 'qunit';

import { contains } from 'pinochle/helpers/contains';

module('Unit | Helper | contains', function () {
  test('it works', function (assert) {
    assert.true(contains([[1], 1]));
    assert.false(contains([[2], 1]));
    assert.false(contains([[2], '2']), 'no coercion ');
  });
});
