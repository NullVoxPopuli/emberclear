import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { getService } from 'emberclear/tests/helpers';

module('Integration | Component | q-r-scanner', function(hooks) {
  setupRenderingTest(hooks);

  let original: any;
  hooks.beforeEach(function() {
    // specific to qr-scanner.js~ish
    original = navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia = () => Promise.reject('Camera not found');
  });

  hooks.afterEach(function() {
    navigator.mediaDevices.getUserMedia = original;
  });

  test('it renders', async function(assert) {
    let intl = getService<Intl>('intl');

    this.setProperties({
      onScan: () => undefined,
      onCancel: () => undefined,
    });
    await render(hbs`<QRScanner @onScan={{this.onScan}} @onCancel={{this.onCancel}}/>`);

    assert.dom('span').containsText('Camera not found');
    assert.dom('span').containsText(intl.t('errors.permissions.enableCamera'));
  });
});
