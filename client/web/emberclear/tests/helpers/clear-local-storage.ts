import Ember from 'ember';
import localforage from 'localforage';
import { getContext } from '@ember/test-helpers';
import { TestContext } from 'ember-test-helpers';

async function cleanEverything(owner: Ember.ApplicationInstance) {
  const adapter = owner.lookup('adapter:application');

  await adapter.cache.clear();

  // specifically, offline storage
  await localforage.clear();
  localStorage.clear();
}

export function clearLocalStorage(hooks: NestedHooks) {
  hooks.beforeEach(async function (this: TestContext) {
    await cleanEverything(this.owner);
  });

  hooks.afterEach(async function (this: TestContext) {
    await cleanEverything(this.owner);
  });
}
