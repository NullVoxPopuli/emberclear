import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { create } from 'ember-cli-page-object';

import { switchWrapper } from '@emberclear/ui/test-support/page-objects';

module('Integration | Component | switch', function (hooks) {
  setupRenderingTest(hooks);

  let page = create(switchWrapper);

  test('it renders', async function (assert) {
    await render(hbs`<Switch @label='test' />`);

    assert.equal(page.label, 'test');
  });

  test('can be toggled', async function (assert) {
    await render(hbs`
      <Switch
        @value={{true}}
        @label='test'
      />
    `);

    assert.equal(page.isChecked, true, 'is checked');

    await page.check();

    assert.equal(page.isChecked, false, 'not checked');
  });
});
