import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { settled } from '@ember/test-helpers';
import { stubConnection } from 'emberclear/tests/helpers/setup-relay-connection-mocks';
import { stubService } from 'emberclear/tests/helpers';

const LINKS = {
  youtube: {
    webUrl: 'https://www.youtube.com/watch?v=w84fToQ6BXY',
  },
  imgur: {
    page: 'https://imgur.com/msqKHPa',
    direct: 'https://i.imgur.com/msqKHPa.jpg',
  },
  giphy: {
    page: 'https://giphy.com/gifs/art-control-remedy-kyv4512wnwDOKn9rWq',
    gif: 'https://media.giphy.com/media/kyv4512wnwDOKn9rWq/giphy.gif',
    html5: 'https://giphy.com/gifs/kyv4512wnwDOKn9rWq/html5',
  },

  other: {
    github: {
      repo: 'https://github.com/NullVoxPopuli/emberclear',
    },
    coveralls: 'https://coveralls.io/github/NullVoxPopuli/emberclear',
  },
};

module('Integration | Component | fetch-open-graph', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);

    this.setProperties({ url: LINKS.youtube.webUrl });

    stubService('connection/status', {
      isConnected: true,
    });

    stubConnection({
      getOpenGraph(...args) {
        assert.equal(args[0], LINKS.youtube.webUrl);

        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(...args);
          }, 10);
        });
      },
    });

    await render(hbs`
      <FetchOpenGraph @url={{this.url}} as |isLoading data|>
        <div data-test-content>
          {{#if (not isLoading)}}
            {{data}}
          {{/if}}
        </div>
      </FetchOpenGraph>
    `);

    assert.dom('[data-test-content]').hasNoText();

    await settled();

    assert.dom('[data-test-content]').hasAnyText();
  });
});
