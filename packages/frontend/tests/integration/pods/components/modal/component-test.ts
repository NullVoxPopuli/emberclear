import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { TestContext } from 'ember-test-helpers';

import { page } from 'emberclear/pods/components/modal/-page';

module('Integration | Component | modal', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
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
        Modal Content
      </Modal>`);
  });

  test('it renders and pressing escape closes', async function(assert) {
    assert.equal(page.modalContent.text, 'Modal Content');

    await page.pressEscape();

    assert.equal(page.modalContent.text, '');
  });

  test('it renders and clicking the backdrop closes', async function(assert) {
    assert.equal(page.modalContent.text, 'Modal Content');

    await page.backdrop.click();

    assert.equal(page.modalContent.text, '');
  });
});
