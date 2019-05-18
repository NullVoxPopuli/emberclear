import { DS } from 'ember-data';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import IdentityService from 'emberclear/services/identity/service';
import {
  getService,
  createCurrentUser,
  setupCurrentUser,
  clearLocalStorage,
} from 'emberclear/tests/helpers';

module('TestHelper | create-current-user', function(hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);

  test('a new user is created and kept in cache', async function(assert) {
    const before = getService<DS.Store>('store').peekAll('identity');

    assert.equal(before.length, 0);

    await createCurrentUser();

    const after = getService<DS.Store>('store').peekAll('identity');

    assert.equal(after.length, 1);
    assert.equal(after.firstObject.id, 'me');
  });

  test('a new user is created and stored', async function(assert) {
    const before = await getService<DS.Store>('store').findAll('identity');

    assert.equal(before.length, 0);

    await createCurrentUser();

    const after = await getService<DS.Store>('store').findAll('identity');

    assert.equal(after.length, 1);
    assert.equal(after.firstObject.id, 'me');
  });

  test('the user is set on the identity service', async function(assert) {
    const before = getService<IdentityService>('identity').record;

    assert.notOk(before);

    const user = await createCurrentUser();

    const after = getService<IdentityService>('identity').record;

    assert.deepEqual(after, user);
  });

  module('user is setup in a beforeEach', function(hooks) {
    setupCurrentUser(hooks);

    test('the user is logged in', function(assert) {
      const isLoggedIn = getService<IdentityService>('identity').isLoggedIn;

      assert.ok(isLoggedIn);
    });

    test('identity exists', async function(assert) {
      const exists = await getService<IdentityService>('identity').exists();

      assert.ok(exists);
    });
  });
});
