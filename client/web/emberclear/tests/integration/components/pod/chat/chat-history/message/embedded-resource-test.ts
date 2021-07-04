import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { stubService } from '@emberclear/test-helpers/test-support';

import type { TestContext } from 'ember-test-helpers';
import type ChatScroller from 'emberclear/services/chat-scroller';

module('Integration | Component | embedded-resource', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    stubService('chat-scroller', {} as LIES<ChatScroller>);
  });

  module('shouldRender', function () {
    module('there is nothing to display', function (hooks) {
      hooks.beforeEach(async function () {
        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource />
        `);
      });

      test('nothing is rendered', async function (assert) {
        const text = (this.element as HTMLElement).innerText.trim();

        assert.equal(text, '');
      });
    });

    module('the url is embeddable', function (hooks) {
      hooks.beforeEach(async function (this: TestContext) {
        this.setProperties({
          someUrl: 'https://i.imgur.com/gCyUdeb.gifv',
          meta: {
            hasExtension: true,
            isImage: true,
          },
        });

        await render(hbs`
          <Pod::Chat::ChatHistory::Message::EmbeddedResource
            @url={{this.someUrl}}
            @meta={{this.meta}}
          />
        `);
      });

      // TODO: for some reason I can't stub this component's services
      test('the rendered content is not blank', function (assert) {
        let text = this.element.innerHTML;

        assert.notEqual(text, '', 'html is not empty');
        assert.contains(text, 'imgur');
      });
    });
  });

  module('The media preview is collapsable', function () {
    module('when collapsed', function () {
      skip('shows nothing', async function () {});

      module('clicking the expand icon', function () {
        skip('shows the content', function () {});
      });
    });

    module('when open', function () {
      skip('the content is visible', function () {});

      module('clicking the collapse icon', function () {
        skip('hides the content', function () {});
      });
    });
  });

  module('Open Graph Data exists', function () {
    skip('renders the image', async function () {});

    skip('there is no sitename', async function () {});
  });

  module('Open Graph Data does not exist', function () {});
});
