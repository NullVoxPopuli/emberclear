import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, click, render, settled, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { triggerCopySuccess } from 'ember-cli-clipboard/test-support';

import { getService } from 'emberclear/tests/helpers';

module('Integration | Component | copy-text-button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<CopyTextButton @text="To be copied" @label="Copy" />`);
    assert.dom('button').hasNoClass('is-active');
  });

  test('when clicked, the copied message appears', async function(assert) {
    let expectedText = getService<any>('intl').t('ui.invite.copied');

    await render(hbs`
      <CopyTextButton
        data-test-copy-text
        @text="To be copied"
        @label="Copy" />
    `);

    // Fake click. Clipboard not supported in testing.
    triggerCopySuccess('[data-test-copy-text]');

    assert.dom('button').hasClass('is-active');
    assert.dom('button').containsText(expectedText);

    await settled();
    assert.dom('button').hasNoClass('is-active');
  });
});
