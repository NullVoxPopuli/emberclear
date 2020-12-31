import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | share-link', function (hooks) {
  setupRenderingTest(hooks);

  // How do you test the clipboard?
  // Do I need to stub this out during tests?
  // Need ember-browser-services
  skip('it renders', async function (assert) {
    let text = 'some text';
    this.setProperties({ text });

    await render(hbs`<ShareLink @url={{this.text}} />`);

    await click('button');

    assert.equal(navigator.clipboard.readText(), text);
  });
});
