import Ember from 'ember';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | identity', function(hooks) {
  setupTest(hooks);

  test('can dump and reload', async function(assert) {
    assert.expect(3);

    const name = 'test identity';
    let service = this.owner.lookup('service:identity');

    await Ember.run(() => service.create(name));
    // await service.create(name);
    service.set('record', null);
    await Ember.run(() => service.load());

    assert.ok(service.record);
    assert.equal(service.name, name);
    assert.ok(service.privateKey);
  });
});
