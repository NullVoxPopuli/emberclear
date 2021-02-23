import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import {
  clearLocalStorage,
  createCurrentUser,
  setupCurrentUser,
} from '@emberclear/local-account/test-support';
import { getService, getStore } from '@emberclear/test-helpers/test-support';

module('TestHelper | create-current-user', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  test('a new user is created and kept in cache', async function (assert) {
    const before = getStore().peekAll('user');

    assert.equal(before.length, 0);

    await createCurrentUser();

    const after = getStore().peekAll('user');

    assert.equal(after.length, 1);
    assert.equal(after.toArray()[0].id, 'me');
  });

  test('a new user is created and stored', async function (assert) {
    const before = await getStore().findAll('user');

    assert.equal(before.length, 0);

    await createCurrentUser();

    const after = await getStore().findAll('user');

    assert.equal(after.length, 1);
    assert.equal(after.toArray()[0].id, 'me');
  });

  test('the user is set on the identity service', async function (assert) {
    const before = getService('current-user').__record__;

    assert.notOk(before);

    const user = await createCurrentUser();

    const after = getService('current-user').__record__;

    assert.deepEqual(after, user);
  });

  module('user is setup in a beforeEach', function (hooks) {
    setupCurrentUser(hooks);

    test('the user is logged in', function (assert) {
      const isLoggedIn = getService('current-user').isLoggedIn;

      assert.ok(isLoggedIn);
    });

    test('identity exists', async function (assert) {
      const exists = await getService('current-user').exists();

      assert.ok(exists);
    });
  });
});
