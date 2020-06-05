import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | backdrop', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.setProperties({
      onClick: () => {},
    });

    await render(hbs`<Backdrop @onClick={{this.onClick}} />`);

    assert.equal(this.element.textContent.trim(), '');
  });
});
