import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { timeout } from 'ember-concurrency';

module('Integration | Component | lazy', function (hooks) {
  setupRenderingTest(hooks);

  module('args', function () {
    test('@wait', async function (assert) {
      assert.expect(2);

      let text = 'wait for 10ms';

      this.setProperties({ text });

      render(hbs`
        <Lazy @wait={{10}}>{{this.text}}</Lazy>
      `);

      assert.dom().doesNotContainText(text);

      await timeout(15);

      assert.dom().hasText(text);
    });

    test('@wait & @when', async function (assert) {
      let text = 'wait for 10ms';
      let cond = false;

      this.setProperties({ text, cond });

      render(hbs`
        <Lazy @wait={{10}} @when={{this.cond}}>{{this.text}}</Lazy>
      `);

      assert.dom().doesNotContainText(text);

      await timeout(15);

      assert.dom().doesNotContainText(text);

      this.setProperties({ cond: true });

      await settled();

      assert.dom().hasText(text);
    });

    test('@when', async function (assert) {
      let text = 'wait for 10ms';
      let cond = false;

      this.setProperties({ text, cond });

      render(hbs`
        <Lazy @when={{this.cond}}>{{this.text}}</Lazy>
      `);

      assert.dom().doesNotContainText(text);

      await timeout(15);

      assert.dom().doesNotContainText(text);

      this.setProperties({ cond: true });

      await settled();

      assert.dom().hasText(text);
    });
  });
});
