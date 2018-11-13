import localforage from 'localforage';

async function cleanEverything() {
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
