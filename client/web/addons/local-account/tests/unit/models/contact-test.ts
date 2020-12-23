import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { getStore } from 'emberclear/tests/helpers';
import { buildContact } from 'emberclear/tests/helpers/factories/contact-factory';

module('Unit | Model | contact', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let model = getStore().createRecord('contact', {});

    assert.ok(model);
  });

  module('displayName', function () {
    test('is derived from name and public key', async function (assert) {
      let contact = await buildContact('NullVoxPopuli');

      assert.matches(contact.displayName, /^NullVoxPopuli \([0-9abcdef]{8}\)/);
    });
  });
});
