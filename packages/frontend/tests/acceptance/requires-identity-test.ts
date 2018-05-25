import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import localforage from 'localforage';

module('Acceptance | requires identity', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function() {
    await localforage.clear();
  });

  test('visiting /chat | redirects to setup', async function(assert) {
    await visit('/chat');

    assert.equal(currentURL(), '/setup/new');
  });
});
