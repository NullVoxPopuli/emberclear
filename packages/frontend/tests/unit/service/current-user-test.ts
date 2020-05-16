import { module, skip } from 'qunit';
import { setupTest, test } from 'ember-qunit';
import CurrentUserService from 'emberclear/services/current-user';
import { getService } from 'emberclear/tests/helpers';
import { generateAsymmetricKeys } from 'emberclear/workers/crypto/utils/nacl';

module('Unit | Service | identity', function (hooks) {
  setupTest(hooks);

  let service: CurrentUserService;

  hooks.beforeEach(() => {
    service = getService('current-user');
  });

  test('importFromKey where privateSigningKey is not present generates signing keys', async function (assert) {
    let keys = await generateAsymmetricKeys();
    await service.importFromKey('name', keys.privateKey);
    assert.notStrictEqual(await service.currentUser(), null);
    assert.ok((await service.currentUser())?.publicSigningKey);
    assert.ok((await service.currentUser())?.privateSigningKey);
  });

  skip('can dump and reload', async function (assert) {
    assert.expect(0);
  });
});
