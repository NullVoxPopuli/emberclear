import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getStore } from 'emberclear/tests/helpers';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let model = getStore().createRecord('user', {});

    assert.ok(model);
  });
});
