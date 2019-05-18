import {
  visit as dangerousVisit,
  getContext,
  getSettledState,
  teardownContext,
} from '@ember/test-helpers';
import a11yAuditIf from 'ember-a11y-testing/test-support/audit-if';
import { percySnapshot } from 'ember-percy';
import { getService } from './get-service';

export { stubService } from './stub-service';
export { textFor, text } from './text-for';
export { createCurrentUser, setupCurrentUser } from './create-current-user';
export { getService } from './get-service';
export { clearLocalStorage } from './clear-local-storage';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { getStore } from './get-store';
export { trackAsyncDataRequests } from './track-async-data';
export { buildIdentity, attributesForUser, createIdentity } from './user-factory';

export { refresh } from './refresh';
export { waitUntilTruthy } from './waitUntilTruthy';
export { setupWindowNotification } from './setupWindowNotification';

export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    // console.error('visit wrapper around default visit helper', e);
  }
}

export function assertExternal(assert: any) {
  percySnapshot(assert);
  a11yAuditIf();
}

export function clearToasts(hooks: NestedHooks) {
  hooks.afterEach(function() {
    const toasts = getService('notification-messages');
    toasts.clear();
    toasts.clearAll();
  });
}
