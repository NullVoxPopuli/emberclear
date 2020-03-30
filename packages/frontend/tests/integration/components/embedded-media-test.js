import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | embedded-media', function (hooks) {
  setupRenderingTest(hooks);

  module('rendered media is different based on meta', function () {
    test('youtube', async function (assert) {
      this.setProperties({ url: 'url', meta: { isYouTube: true } });

      await render(hbs`<EmbeddedMedia @url={{this.url}} @meta={{this.meta}} />`);

      assert.dom('iframe').exists();
    });

    test('image', async function (assert) {
      this.setProperties({ url: 'url', meta: { isImage: true } });

      await render(hbs`<EmbeddedMedia @url={{this.url}} @meta={{this.meta}} />`);

      assert.dom('img').exists();
    });

    test('video', async function (assert) {
      this.setProperties({ url: 'url', meta: { isVideo: true } });

      await render(hbs`<EmbeddedMedia @url={{this.url}} @meta={{this.meta}} />`);

      assert.dom('video').exists();
    });

    test('other', async function (assert) {
      this.setProperties({ url: 'url', meta: {} });

      await render(hbs`<EmbeddedMedia @url={{this.url}} @meta={{this.meta}} />`);

      assert.dom('*').doesNotExist();
    });
  });
});
