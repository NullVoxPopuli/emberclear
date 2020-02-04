import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { page } from 'lib/ui/addon/components/ui/switch/-page';

module('Integration | Component | switch', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<Switch @label='test' />`);

    assert.equal(page.label, 'test');
  });

  test('can be toggled', async function(assert) {
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
