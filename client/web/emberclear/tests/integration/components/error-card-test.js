import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { getService } from 'emberclear/tests/helpers';

module('Integration | Component | error-card', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ErrorCard />`);

    let expected = getService('intl').t('errors.genericTitle');

    assert.equal(this.element.textContent.trim(), expected);
  });
});
