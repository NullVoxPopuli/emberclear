import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dropdown', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <Dropdown>
        <:trigger as |toggle|>
          <button {{on 'click' toggle}} type='button'>Toggle</button>
        </:trigger>

        <:content>
          Content Here
        </:content>
      </Dropdown>
    `);

    assert
      .dom(this.element)
      .hasText('Toggle Content Here', 'all text is shown, cause this is a CSS effect');
  });
});
