import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest, skip } from 'ember-qunit';

import { setupRelayConnectionMocks } from 'emberclear/tests/helpers';
import { createChannel } from 'emberclear/tests/helpers/factories/channel-factory';
import { page } from 'emberclear/tests/helpers/pages/chat';
import { toast } from 'emberclear/tests/helpers/pages/toast';

import { clearLocalStorage, setupCurrentUser } from '@emberclear/local-account/test-support';
import { visit } from '@emberclear/test-helpers/test-support';

import type { Channel } from '@emberclear/local-account';

module('Acceptance | Chat | Privately With', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  module('is not logged in', function (hooks) {
    setupRelayConnectionMocks(hooks);

    hooks.beforeEach(async function () {
      await visit('/chat/in-channel');
    });

    test('document.title is unchanged', async function (assert) {
      assert.ok(document.title.startsWith('emberclear'));
    });
  });

  module('is logged in', function (hooks) {
    setupCurrentUser(hooks);

    module('channel does not exist', function (hooks) {
      setupRelayConnectionMocks(hooks);

      hooks.beforeEach(async function () {
        await visit('/chat/in-channel/nowhere');
      });

      test('redirects', async function (assert) {
        await toast.waitForToast();

        assert.equal(currentURL(), '/chat');
        assert.contains(toast.text, 'not be located');
      });
    });

    module('channel exists', function (hooks) {
      setupRelayConnectionMocks(hooks);

      let channel!: Channel;

      hooks.beforeEach(async function () {
        channel = await createChannel('Vertical Flat Plates');

        await visit(`/chat/in-channel/${channel.id}`);
      });

      skip('does not redirect', function (assert) {
        assert.equal(currentURL(), `/chat/in-channel/${channel.id}`);
        assert.equal(page.messages.length, 0);
      });
    });
  });
});
