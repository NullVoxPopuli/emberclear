import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import {
  setupCurrentUser,
  setupRelayConnectionMocks,
  setupRouter,
  visit,
} from 'emberclear/tests/helpers';

import type { TestContext } from 'ember-test-helpers';

module('Routing | Feature Flags', function (hooks) {
  setupApplicationTest(hooks);
  setupCurrentUser(hooks);
  setupRelayConnectionMocks(hooks);
  setupRouter(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.owner.register(
      'template:application',
      hbs`<div id='foo'>{{has-feature-flag 'channels'}}</div>{{outlet}}`
    );
    this.owner.register('template:chat', hbs`<div id='bar'>{{has-feature-flag 'channels'}}</div>`);
  });

  hooks.afterEach(async function () {
    await visit('/'); // clear search params
  });

  test('Query Param is present', async function (assert) {
    await visit('/?_features=channels');

    assert.dom('#foo').hasText('true');

    await visit('/chat?_features=channels');

    assert.dom('#bar').hasText('true');
  });

  test('No Query Param are initially present', async function (assert) {
    await visit('/');

    assert.dom('#foo').hasText('false');

    await visit('/chat?_features=channels');

    assert.dom('#bar').hasText('true');
  });

  module('Different Query Param is present', function () {
    test('helpers work', async function (assert) {
      await visit('/?_features=video-calling');

      assert.dom('#foo').hasText('false');

      await visit('/chat?_features=channels');

      assert.dom('#bar').hasText('true');
    });
  });
});
