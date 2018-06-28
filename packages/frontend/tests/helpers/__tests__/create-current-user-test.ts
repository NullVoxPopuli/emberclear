import { DS } from 'ember-data';
import { run } from '@ember/runloop';
import { module, test, skip } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

import localforage from 'localforage';

import { nameForm } from 'emberclear/tests/helpers/pages/setup';
import { getService } from 'emberclear/tests/helpers/get-service';
import { createCurrentUser } from 'emberclear/tests/helpers';
import IdentityService from 'emberclear/services/identity/service';

module('TestHelper | create-current-user', function(hooks) {
  setupApplicationTest(hooks);

  test('a new user is created', async function(assert) {
    const before = getService<DS.Store>('store').peekAll('identity');

    assert.equal(before.length, 0);

    await createCurrentUser();

    const after = getService<DS.Store>('store').peekAll('identity');

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
});
