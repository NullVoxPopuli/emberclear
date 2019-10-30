import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { create, text, clickable } from 'ember-cli-page-object';

let page = create({
  isActive: text('[data-test-active]'),
  toggle: clickable('[data-test-toggle]'),
  open: clickable('[data-test-open]'),
  close: clickable('[data-test-close]'),
});

module('Integration | Component | modal-static', function(hooks) {
  setupRenderingTest(hooks);

  module('yielded data is interactable', function(hooks) {
    hooks.beforeEach(async function() {
      await render(hbs`
        <ModalStatic @name='interactable' as |isActive actions|>
          <span data-test-active>{{isActive}}</span>

          <button data-test-toggle {{on 'click' actions.toggle}}></button>
          <button data-test-open {{on 'click' actions.open}}></button>
          <button data-test-close {{on 'click' actions.close}}></button>
        </ModalStatic>
      `);
    });

    test('is toggleable', async function(assert) {
      assert.equal(page.isActive, 'false');

      await page.toggle();
      assert.equal(page.isActive, 'true');

      await page.toggle();
      assert.equal(page.isActive, 'false');
    });

    test('can be opened', async function(assert) {
      assert.equal(page.isActive, 'false');

      await page.open();
      assert.equal(page.isActive, 'true');

      await page.open();
      assert.equal(page.isActive, 'true');
    });

    test('can be closed', async function(assert) {
      assert.equal(page.isActive, 'false');

      await page.toggle();
      assert.equal(page.isActive, 'true');

      await page.close();
      assert.equal(page.isActive, 'false');

      await page.close();
      assert.equal(page.isActive, 'false');
    });
  });
});
