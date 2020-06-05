import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | external-link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<ExternalLink />`);

    assert.equal(this.element.textContent.trim(), '');

    await render(hbs`
      <ExternalLink>
        template block text
      </ExternalLink>
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
