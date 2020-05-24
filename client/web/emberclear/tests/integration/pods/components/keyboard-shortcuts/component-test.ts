import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | keyboard-shortcuts', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.setProperties({
      noop: () => undefined,
    });

    await render(hbs`<KeyboardShortcuts @isActive={{true}} @close={{this.noop}}/>`);

    assert.dom('[data-test-keyboard-shortcuts]').exists();
  });
});
