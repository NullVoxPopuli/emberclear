import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

import { TestContext } from 'ember-test-helpers';

import { page } from 'emberclear/pods/components/app-footer/-page';

module('Integration | Component | app-footer', function(hooks) {
  setupRenderingTest(hooks);

  module('donate address is toggleable', function(hooks) {
    hooks.beforeEach(async function(this: TestContext, assert) {
      await render(hbs`<AppFooter />`);

      assert.dom(page.moneroAddress.scope).doesNotExist();

      await page.toggleMonero();
    });

    test('monero address is shown', async function(assert) {
      assert.dom(page.moneroAddress.scope).containsText('XMR');
    });
  });
});
