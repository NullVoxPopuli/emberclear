import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | game', function (hooks) {
  setupApplicationTest(hooks);

  module('Has not previously joined a game', function () {
    test('visiting /game', async function (assert) {
      await visit('/game/12');

      assert.equal(currentURL(), '/join/12');
    });
  });

  module('Has a pre-existing game', function () {});
});
