import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | hamburger-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.setProperties({
      onClick: () => {},
    });

    await render(hbs`<HamburgerButton @onClick={{this.onClick}} />`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
