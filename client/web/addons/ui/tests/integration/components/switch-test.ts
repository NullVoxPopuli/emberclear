import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { create } from 'ember-cli-page-object';
import hbs from 'htmlbars-inline-precompile';

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

    assert.true(page.isChecked, 'is checked');

    await page.check();

    assert.false(page.isChecked, 'not checked');
  });
});
