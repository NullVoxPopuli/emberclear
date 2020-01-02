import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

import { page } from 'emberclear/components/pod/application/top-nav/locale-select/-page';
import { clearLocalStorage } from 'emberclear/tests/helpers';

module('Integration | Component | application/top-nav/locale-select', function(hooks) {
  setupRenderingTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(async function() {
    await render(hbs`<Pod::Application::TopNav::LocaleSelect />`);
  });

  test('starts closed', function(assert) {
    assert.notOk(page.isOpen, 'is closed');
  });

  module('is opened', function(hooks) {
    hooks.beforeEach(async function(assert) {
      await page.toggle();

      assert.ok(page.isOpen);
    });

    module('a non-default lang is selected', function(hooks) {
      hooks.beforeEach(async function() {
        await page.optionFor('Español').click();
      });

      test('the menu is closed', function(assert) {
        assert.notOk(page.isOpen);
      });
    });
  });
});
