import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { getService } from 'emberclear/tests/helpers';
import { STATUS_CONNECTING } from 'emberclear/utils/connection-pool';
import { timeout } from 'ember-concurrency';

module('Unit | Service | connection/status', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = getService('connection/status');
    assert.ok(service);
  });

  test('updating the status sets properties', async function(assert) {
    let service = getService('connection/status');

    assert.equal(service.text, '');
    assert.equal(service.level, '');
    assert.notOk(service.hasUpdate);
    assert.notOk(service.hadUpdate);

    service.updateStatus(STATUS_CONNECTING);

    assert.equal(service.text, STATUS_CONNECTING);
    assert.equal(service.level, 'info');

    assert.ok(service.hasUpdate);
    assert.notOk(service.hadUpdate);

    await timeout(2200);

    assert.ok(service.hadUpdate);
    assert.ok(service.hasUpdate);

    await timeout(1200);

    assert.notOk(service.hasUpdate);
  });
});
