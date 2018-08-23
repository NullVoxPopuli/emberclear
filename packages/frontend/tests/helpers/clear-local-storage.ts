import localforage from 'localforage';

async function cleanEverything() {
  localStorage.clear();

  // specifically, offline storage
  await localforage.clear();
}

export function clearLocalStorage(hooks) {
  // hooks.beforeEach(async function() {
  //   await cleanEverything();
  // });

  hooks.afterEach(async function() {
    await cleanEverything();
  });
}
