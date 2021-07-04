import { module, test } from 'qunit';

import { isNumber } from 'pinochle/helpers/is-number';

module('Integration | Helper | is-number', function () {
  test('it works', async function (assert) {
    assert.true(isNumber([1]));
    assert.false(isNumber(['2']), 'no coercion');
    assert.false(isNumber(['queen']));
  });
});
