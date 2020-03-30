import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { getService } from 'emberclear/tests/helpers';
import { toast } from 'emberclear/tests/helpers/pages/toast';

module('Integration | Component | q-r-scanner', function (hooks) {
  setupRenderingTest(hooks);

  let original: any;
  hooks.beforeEach(function () {
    // specific to qr-scanner.js~ish
    if (!navigator.mediaDevices) {
      (navigator.mediaDevices as any) = {};
    }
    original = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = () => Promise.reject('Camera not found');
  });

  hooks.afterEach(function () {
    navigator.mediaDevices.getUserMedia = original;
  });

  test('it renders', async function (assert) {
    let intl = getService('intl');

    this.setProperties({
      onScan: () => undefined,
    });

    await render(hbs`<QRScanner @onScan={{this.onScan}} />`);

    assert.contains(toast.text, intl.t('errors.permissions.enableCamera'));
  });
});
