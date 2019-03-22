import {
  visit as dangerousVisit,
  setupContext,
  teardownContext,
  getContext,
  currentURL,
  getSettledState,
} from '@ember/test-helpers';
import a11yAuditIf from 'ember-a11y-testing/test-support/audit-if';
import { percySnapshot } from 'ember-percy';

export { stubService } from './stub-service';
export { textFor, text } from './text-for';
export { createCurrentUser, setupCurrentUser } from './create-current-user';
export { getService } from './get-service';
export { clearLocalStorage } from './clear-local-storage';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { getStore } from './get-store';
export { trackAsyncDataRequests } from './track-async-data';
export { buildIdentity, attributesForUser, createIdentity } from './user-factory';

export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    // console.error('visit wrapper around default visit helper', e);
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

export function assertExternal(assert: any) {
  percySnapshot(assert);
  a11yAuditIf();
}

export async function refresh(mocking: () => void = () => undefined) {
  const url = currentURL();
  const ctx = getContext();

  await teardownContext(ctx);
  await setupContext(ctx);

  await mocking();

  await visit(url);
}

export function clearToasts(hooks: NestedHooks) {
  hooks.afterEach(function() {
    const ctx = getContext();
    const toasts = ctx.owner.lookup('service:notification-messages');
    toasts.clear();
    toasts.clearAll();
  });
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

  let startTime = new Date();
  return Promise.race([
    new Promise((resolve, reject) => {
      let interval = setInterval(async () => {
        if (new Date() - startTime > 500) {
          clearInterval(interval);
          reject(`Timed out after ${timeoutMs}`);
        }
        let result = false;

        try {
          result = await func();
        } catch (e) {
          // ignored
        }

        if (result) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    }),
    timeout,
  ]);
}
