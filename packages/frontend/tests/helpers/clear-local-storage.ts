import localforage from 'localforage';
import { getContext } from '@ember/test-helpers';

async function cleanEverything() {
  const context = getContext();
  if (context) {
    const adapter = context.owner.lookup('adapter:application');

    await adapter.cache.clear();
  }

  // specifically, offline storage
  await localforage.clear();
  await localStorage.clear();
}

export function clearLocalStorage(hooks: NestedHooks) {
  hooks.beforeEach(async function() {
    await cleanEverything();
  });

  hooks.afterEach(async function() {
    await cleanEverything();
  });
}
