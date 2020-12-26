import { module, skip } from 'qunit';
import { setupTest, test } from 'ember-qunit';

import { generateAsymmetricKeys } from '@emberclear/crypto/workers/crypto/utils/nacl';
import { getService } from '@emberclear/test-helpers/test-support';

import type { CurrentUserService } from '@emberclear/local-account';

module('Unit | Service | identity', function (hooks) {
  setupTest(hooks);

  let service: CurrentUserService;

  hooks.beforeEach(() => {
    service = getService('current-user');
  });

  test('importFromKey where privateSigningKey is not present generates signing keys', async function (assert) {
    let keys = await generateAsymmetricKeys();

    await service.importFromKey('name', keys.privateKey);

    assert.ok(service.record);
    assert.ok(service.record.publicSigningKey);
    assert.ok(service.record.privateSigningKey);
  });

  skip('can dump and reload', async function (assert) {
    assert.expect(0);
  });
});
