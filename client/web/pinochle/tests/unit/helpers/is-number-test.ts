import { module, test } from 'qunit';

import { isNumber } from 'pinochle/helpers/is-number';

module('Integration | Helper | is-number', function (hooks) {
  test('it works', async function (assert) {
    assert.equal(isNumber([1]), true);
    assert.equal(isNumber(['2']), false, 'no coercion');
    assert.equal(isNumber(['queen']), false);
  });
});
