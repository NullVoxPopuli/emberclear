import { module, test } from 'qunit';
import { render, find } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';

import { TestContext } from 'ember-test-helpers';

module('Integration | Component | metadata-preview', function(hooks) {
  setupRenderingTest(hooks);

  module('image / thumbnail preview', function() {
    module('there is no image in the og data', function(hooks) {
      hooks.beforeEach(async function(this: TestContext) {
        this.set('data', {});
        await render(hbs`
         <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview />
        `);
      });

      test('no image is shown', function(assert) {
        const img = find('img');

        assert.notOk(img);
      });
    });

    module('there is an image in the og data', function(hooks) {
      hooks.beforeEach(async function(this: TestContext) {
        this.set('data', {
          image: 'https://something',
        });

        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource::MetadataPreview
            @ogData={{this.data}}
          />
        `);
      });

      test('an image tag is present', function(assert) {
        const img = find('img');

        assert.ok(img, 'the html tag is present');
        assert.equal(img!.getAttribute('alt'), 'Thumbnail', 'has alt text');
      });
    });
  });
});
