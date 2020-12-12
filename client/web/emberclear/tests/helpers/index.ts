import { visit as dangerousVisit } from '@ember/test-helpers';
import { getContext } from '@ember/test-helpers';

// import a11yAuditIf from 'ember-a11y-testing/test-support/audit-if';
import { percySnapshot } from 'ember-percy';

export { clearLocalStorage } from './clear-local-storage';
export * from './create-current-user';
export { getService } from './get-service';
export { getStore } from './get-store';
export { refresh } from './refresh';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { setupEmberclearTest } from './setup-test';
export { setupWorkers } from './setup-workers';
export { stubService } from './stub-service';
export { trackAsyncDataRequests } from './track-async-data';
export { waitUntilTruthy } from './waitUntilTruthy';

export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    if (!e.message.includes('TransitionAborted')) {
      throw e;
    }
  }
}

export function assertExternal(assert: any) {
  percySnapshot(assert);
  // a11yAuditIf();
}

export function setupRouter(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    let { owner } = getContext() as any;

    // eslint-disable-next-line ember/no-private-routing-service
    owner.lookup('router:main').setupRouter();
  });
}
