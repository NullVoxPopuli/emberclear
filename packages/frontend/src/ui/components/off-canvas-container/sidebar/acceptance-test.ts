import { module, test } from 'qunit';
import DS from 'ember-data';

import { visit, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  setupRelayConnectionMocks,
  setupCurrentUser,
  getService
} from 'emberclear/tests/helpers';


import { sidebar } from 'emberclear/tests/helpers/pages/sidebar';

module('Acceptance | Sidebar', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupRelayConnectionMocks(hooks);
  setupCurrentUser(hooks);

  hooks.beforeEach(async function() {
    await visit('/chat');
    await sidebar.toggle();
  });

  module('Channels', function(hooks) {
    test('the channel form is not visible', function(assert) {
      const form = sidebar.channels.form();

      assert.notOk(form);
    });

    test('there are 0 channels', async function(assert) {
      const store = getService<DS.Store>('store');
      const known = await store.findAll('channel');

      assert.equal(known.length, 0);
    });

    module('the add channel button is clicked', function(hooks) {
      hooks.beforeEach(async function() {
        await sidebar.channels.toggleForm();
      });

      test('the channel form is now visible', function(assert) {
        const form = sidebar.channels.form();

        assert.ok(form);
      });

      module('the cancel button is clicked', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.toggleForm();
          await settled();
        });

        test('the channel form is not visible', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });
      });

      module('the channel form is submitted', function(hooks) {
        hooks.beforeEach(async function() {
          await sidebar.channels.fillInput('Vertical Flat Plates');
          await sidebar.channels.submitForm();
          await settled();
        });

        test('the form becomes hidden', function(assert) {
          const form = sidebar.channels.form();

          assert.notOk(form);
        });


        test('a channel is created', function(assert) {
          const store = getService<DS.Store>('store');
          const known = store.peekAll('channel');

          assert.equal(known.length, 1);
          assert.equal(known.firstObject.name, 'Vertical Flat Plates');
        });
      });
    });
  });
});
