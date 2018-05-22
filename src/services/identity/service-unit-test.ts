import Ember from 'ember';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | identity', function(hooks) {
  setupTest(hooks);

  test('can dump and reload', async function(assert) {
    assert.expect(3);

    let service = this.owner.lookup('service:identity');
    await service.create('test identity');

    service.set('record', null);
    Ember.run(() => service.load());

    assert.ok(service.record);
    assert.equal(service.name, 'test identity');
    console.log(service.record);
    assert.ok(service.privateKey);
  });
});
