import { click, find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | collapsible', function (hooks) {
  setupRenderingTest(hooks);

  test('is interactible', async function (assert) {
    await render(hbs`
      <Collapsible as |isOpen toggle Icon|>
        <span class='is-open'>{{isOpen}}</span>

        <button class='toggle' {{on 'click' toggle}}>
          <Icon @isOpen={{isOpen}} />
          Toggle
        </button>
      </Collapsible>
    `);

    assert.equal(find('.is-open')!.textContent, 'true');

    await click('.toggle');

    assert.equal(find('.is-open')!.textContent, 'false');
  });
});
