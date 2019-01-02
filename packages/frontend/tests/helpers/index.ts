import {
  visit as dangerousVisit,
  setupContext,
  teardownContext,
  getContext,
  currentURL,
} from '@ember/test-helpers';

export { stubService } from './stub-service';
export { textFor, text } from './text-for';
export { createCurrentUser, setupCurrentUser } from './create-current-user';
export { getService } from './get-service';
export { clearLocalStorage } from './clear-local-storage';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { getStore } from './get-store';
export { trackAsyncDataRequests } from './track-async-data';
export { cancelLongRunningTimers } from './cancel-long-running-timers';
export { buildIdentity, attributesForUser, createIdentity } from './user-factory';

export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    console.error('visit wrapper around default visit helper', e);
  }
}

export function setupWindowNotification(hooks: NestedHooks) {
  let originalNotification;

  hooks.beforeEach(function() {
    originalNotification = window.Notification;
  });

  hooks.afterEach(function() {
    window.Notification = originalNotification;
  });
}

export async function refresh(mocking: () => void = () => undefined) {
  const url = currentURL();
  const ctx = getContext();

  await teardownContext(ctx);
  await setupContext(ctx);

  await mocking();

  await visit(url);
}

export async function waitUntilTruthy(func: Function, timeoutMs = 500) {
  let interval: NodeJS.Timeout;

  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      clearInterval(interval);
      reject(`Timed out after ${timeoutMs} ms.`);
    }, timeoutMs);
  });

  return Promise.race([
    new Promise(resolve => {
      let interval = setInterval(async () => {
        let result = await func();

        if (result) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    }),
    timeout,
  ]);
}
