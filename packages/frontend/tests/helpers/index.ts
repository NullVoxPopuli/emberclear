import { visit as dangerousVisit } from '@ember/test-helpers';

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
    console.error(e);
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
