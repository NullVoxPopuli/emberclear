import { module, test } from 'qunit';

import { visit, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks
} from 'emberclear/tests/helpers';


import { app } from 'emberclear/tests/helpers/pages/app';

module('Acceptance | Navigation Scrolling', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);

  hooks.beforeEach(async function() {
    await visit('/');
  });

  module('When in a short viewport', function(hooks) {
    hooks.beforeEach(function() {
      app.scrollContainer().style='height: 300px';
    });

    hooks.afterEach(function() {
      app.scrollContainer().style = '';
    });

    module('When scrolled to the bottom', function(hooks) {
      hooks.beforeEach(async function() {
        await app.footer.faq().scrollIntoView(false);
        await triggerEvent(window, 'scroll');
      });

      test('the top of the page is not visible', function(assert) {
        const position = app.scrollContainer().scrollTop;

        assert.notEqual(position, 0, 'the scroll container is not at the top');
      });

      module('Clicking to another page', function(hooks) {
        hooks.beforeEach(async function() {
          await app.footer.clickFaq();
        });

        test('the top of the page is visible', function(assert) {
          const position = app.scrollContainer().scrollTop;

          assert.equal(position, 0, 'the scroll container is at the top');
        });
      });
    });

  });
});
