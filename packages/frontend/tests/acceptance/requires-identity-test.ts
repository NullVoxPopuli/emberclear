import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import { clearLocalStorage, stubService } from 'emberclear/tests/helpers';

module('Acceptance | requires identity', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; }
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' }
    ]);
  });

  test('visiting /chat | redirects to setup', async function(assert) {
    await visit('/chat');

    assert.equal(currentURL(), '/setup/new');
  });

  test('visiting /contacts | redirects to setup', async function(assert) {
    await visit('/contacts');

    assert.equal(currentURL(), '/setup/new');
  });

  test('visiting /invite | redirects to setup', async function(assert) {
    await visit('/invite');

    assert.equal(currentURL(), '/setup/new');
  });

  test('visiting /logout | redirects to setup', async function(assert) {
    await visit('/logout');

    assert.equal(currentURL(), '/setup/new');
  });


  test('visiting /settings | redirects to setup', async function(assert) {
    await visit('/settings');

    assert.equal(currentURL(), '/setup/new');
  });

});
