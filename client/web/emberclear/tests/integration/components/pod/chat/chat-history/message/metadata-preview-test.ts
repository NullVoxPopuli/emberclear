import { module, test } from 'qunit';
import { render, find } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

import type { TestContext } from 'ember-test-helpers';

module('Integration | Component | metadata-preview', function (hooks) {
  setupRenderingTest(hooks);

  module('no ogData', function (hooks) {
    hooks.beforeEach(function (this: TestContext) {
      this.set('data', {});
    });

    test('nothing is shown', async function (assert) {
      await render(hbs`
        <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview
          @ogData={{this.data}}
        />
      `);

      assert.dom(this.element).hasNoText();
    });
  });

  module('has Open Graph data', function () {
    test('there is a title', async function (assert) {
      this.set('data', { title: 'a title' });

      await render(hbs`
        <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview
          @ogData={{this.data}}
        />
      `);

      assert.dom(this.element).hasText('a title');
    });

    test('there is a description', async function (assert) {
      this.set('data', { description: 'a description' });

      await render(hbs`
        <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview
          @ogData={{this.data}}
        />
      `);

      assert.dom(this.element).hasText('a description');
    });
  });

  module('image / thumbnail preview', function () {
    module('there is no image in the og data', function (hooks) {
      hooks.beforeEach(async function (this: TestContext) {
        this.set('data', {});
        await render(hbs`
         <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview />
        `);
      });

      test('no image is shown', function (assert) {
        const img = find('img');

        assert.notOk(img);
      });
    });

    module('there is an image in the og data', function (hooks) {
      hooks.beforeEach(async function (this: TestContext) {
        this.setProperties({
          data: {
            image: 'https://something',
          },
        });

        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview
            @ogData={{this.data}}
          />
        `);
      });

      test('an image tag is present', function (assert) {
        const img = find('img');

        assert.ok(img, 'the html tag is present');
        assert.dom('img').hasAttribute('src');
        assert.dom('img').hasAttribute('alt');
        assert.contains(img!.getAttribute('src'), 'https://');
      });
    });
  });
});
