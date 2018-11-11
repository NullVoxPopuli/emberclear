import { module, test, skip } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { stubService } from 'emberclear/tests/helpers';
import { TestContext } from 'ember-test-helpers';

function disableOpenGraphFetching(hooks: NestedHooks, respondWith = {}) {
  hooks.beforeEach(function () {
    stubService('relay-manager', {
      getOpenGraph: (_url: string) => (respondWith)
    });
  });
}

module('Integration | Component | embedded-resource', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(() => {
    stubService('relay-connection', {
      connect() { return; }
    });
    stubService('chat-scroller', {});
  });

  module('shouldRender', function() {
    module('there is nothing to display', function(hooks) {
      disableOpenGraphFetching(hooks);

      hooks.beforeEach(async function() {
        // await render(hbs`{{embedded-resource}}`);
        // await render(hbs`<EmbeddedResource />`);
      });

      skip('nothing is rendered', async function(assert) {
        const text = this.element.innerHTML.trim();

        assert.equal(text, '');
      });
    });

    module('there url is embeddable', function(hooks) {
      disableOpenGraphFetching(hooks);

      hooks.beforeEach(async function(this: TestContext) {
        this.set('someUrl', 'https://i.imgur.com/gCyUdeb.gifv');
        await render(hbs`<EmbeddedResource @url=someUrl />`);
        // await render(hbs`{{embedded-resource url=someUrl}}`);
      });

      skip('the rendered content is not blank', function(assert) {
        const text = this.element.innerText;

        assert.notEqual(text, '');
      });
    });
  });

  module('The media preview is collapsable', async function() {
    module('when collapsed', function() {
      skip('shows nothing', async function(_assert) {

      });

      module('clicking the expand icon', function() {
        skip('shows the content', function(_assert) {

        });
      });
    });

    module('when open', function() {
      skip('the content is visible', function(_assert) {

      });

      module('clicking the collapse icon', function() {
        skip('hides the content', function(_assert) {

        });
      });
    });
  });

  module('Open Graph Data exists', function() {
    skip('renders the image', async function(_assert) {

    });

    skip('there is no sitename', async function(_assert) {

    });
  });

  module('Open Graph Data does not exist', function() {
  });
});
