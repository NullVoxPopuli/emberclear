import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

import { page } from 'emberclear/components/pod/settings/interface/-page';
import { getService, clearLocalStorage } from 'emberclear/tests/helpers';
import { THEMES } from 'emberclear/services/settings';

module('Integration | Component | settings/interface', function(hooks) {
  setupRenderingTest(hooks);
  clearLocalStorage(hooks);

  module('Hide Offline Contacts', function() {
    test('state matches service', async function(assert) {
      await render(hbs`<Pod::Settings::Interface />`);

      let settingsService = getService('settings');

      assert.notOk(settingsService.hideOfflineContacts, 'Service is false');
      assert.notOk(page.hideOfflineContacts.isChecked, 'Checkbox is unchecked');

      await page.hideOfflineContacts.check();

      assert.ok(settingsService.hideOfflineContacts, 'Service is true');
      assert.ok(page.hideOfflineContacts.isChecked, 'Checkbox is checked');
    });
  });

  module('Themes', function() {
    module('Selecting Midnight', function() {
      test('data is sync with the settings service', async function(assert) {
        await render(hbs`<Pod::Settings::Interface />`);

        let settingsService = getService('settings');

        assert.equal(settingsService.theme, THEMES.default);
        assert.notOk(page.themes.selectMidnight.isChecked, 'is not checked');

        await page.themes.selectMidnight.check();

        assert.equal(settingsService.theme, THEMES.midnight);
        assert.ok(page.themes.selectMidnight.isChecked, 'Midnight is selected');
      });
    });
  });
});
