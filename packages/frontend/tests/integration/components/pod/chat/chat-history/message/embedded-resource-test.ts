import { module, test, skip } from 'qunit';
import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import { stubService } from 'emberclear/tests/helpers';
import { TestContext } from 'ember-test-helpers';

function disableOpenGraphFetching(hooks: NestedHooks, respondWith = {}) {
  hooks.beforeEach(function() {
    stubService('relay-manager', {
      getOpenGraph: async (/* url: string */) => await respondWith,
    });
  });
}

module('Integration | Component | embedded-resource', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    stubService('chat-scroller', {});
  });

  module('shouldRender', function() {
    module('there is nothing to display', function(hooks) {
      disableOpenGraphFetching(hooks, 'hi');

      hooks.beforeEach(async function() {
        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource />
        `);
      });

      test('nothing is rendered', async function(assert) {
        const text = (this.element as HTMLElement).innerText.trim();

        assert.equal(text, '');
      });
    });

    module('the url is embeddable', function(hooks) {
      disableOpenGraphFetching(hooks);

      hooks.beforeEach(async function(this: TestContext) {
        this.set('someUrl', 'https://i.imgur.com/gCyUdeb.gifv');

        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource
            @url={{someUrl}}
          />
        `);
      });

      // TODO: for some reason I can't stub this component's services
      skip('the rendered content is not blank', function(assert) {
        const text = this.element.innerHTML;

        assert.notEqual(text, '', 'html is not empty');
        assert.contains(text, 'imgur');
      });
    });
  });

  module('The media preview is collapsable', async function() {
    module('when collapsed', function() {
      skip('shows nothing', async function() {});

      module('clicking the expand icon', function() {
        skip('shows the content', function() {});
      });
    });

    module('when open', function() {
      skip('the content is visible', function() {});

      module('clicking the collapse icon', function() {
        skip('hides the content', function() {});
      });
    });
  });

  module('Open Graph Data exists', function() {
    skip('renders the image', async function() {});

    skip('there is no sitename', async function() {});
  });

  module('Open Graph Data does not exist', function() {});
});
