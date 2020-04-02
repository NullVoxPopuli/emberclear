import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import { setupRouter, setupCurrentUser } from 'emberclear/tests/helpers';

module('Routing | Feature Flags', function (hooks) {
  setupApplicationTest(hooks);
  setupCurrentUser(hooks);
  setupRouter(hooks);

  module('Query Param is present', function () {
    test('helpers work', async function (assert) {
      this.owner.register(
        'template:application',
        hbs`<div id='foo'>{{has-feature-flag 'channels'}}</div>`
      );

      await visit('/?_features=channels');

      assert.dom('#foo').hasText('true');
    });
  });

  module('Not Query Param is present', function () {
    test('helpers work', async function (assert) {
      this.owner.register(
        'template:application',
        hbs`<div id='foo'>{{has-feature-flag 'channels'}}</div>`
      );

      await visit('/');

      assert.dom('#foo').hasText('false');
    });
  });

  module('Different Query Param is present', function () {
    test('helpers work', async function (assert) {
      this.owner.register(
        'template:application',
        hbs`<div id='foo'>{{has-feature-flag 'channels'}}</div>`
      );

      await visit('/?_features=video-calling');

      assert.dom('#foo').hasText('false');
    });
  });
});
