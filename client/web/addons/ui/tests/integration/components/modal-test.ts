import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { modal } from '@emberclear/ui/test-support/page-objects';

import type { TestContext } from 'ember-test-helpers';
import { create } from 'ember-cli-page-object';

module('Integration | Component | modal', function (hooks) {
  setupRenderingTest(hooks);

  let page = create(modal);

  hooks.beforeEach(async function (this: TestContext) {
    this.setProperties({
      active: true,
      close: () => {
        this.set('active', false);
      },
    });

    await render(hbs`
      <Modal
        @isActive={{this.active}}
        @close={{this.close}}
      >
        <a href=''>Modal Content</a>
      </Modal>`);
  });

  test('it renders and pressing escape closes', async function (assert) {
    assert.equal(page.modalContent.text, 'Modal Content');

    await page.pressEscape();

    assert.equal(page.modalContent.text, '');
  });

  test('it renders and clicking the backdrop closes', async function (assert) {
    assert.equal(page.modalContent.text, 'Modal Content');

    await page.backdrop.click();

    assert.equal(page.modalContent.text, '');
  });
});
