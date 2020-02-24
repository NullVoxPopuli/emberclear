import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | collapsible', function(hooks) {
  setupRenderingTest(hooks);

  test('is interactible', async function(assert) {
    await render(hbs`
      <Ui::Collapsible as |isOpen toggle Icon|>
        <span class='is-open'>{{isOpen}}</span>

        <button class='toggle' {{on 'click' toggle}}>
          <Icon @isOpen={{isOpen}} />
          Toggle
        </button>
      </Ui::Collapsible>
    `);

    assert.equal(find('.is-open')!.textContent, 'true');

    await click('.toggle');

    assert.equal(find('.is-open')!.textContent, 'false');
  });
});
