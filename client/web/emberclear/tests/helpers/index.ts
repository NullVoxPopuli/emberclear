import { visit as dangerousVisit } from '@ember/test-helpers';
// import a11yAuditIf from 'ember-a11y-testing/test-support/audit-if';
import { percySnapshot } from 'ember-percy';
import { getContext } from '@ember/test-helpers';

export { stubService } from './stub-service';
export { textFor, text } from './text-for';
export * from './create-current-user';
export * from './get-worker';
export { getService } from './get-service';
export { clearLocalStorage } from './clear-local-storage';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { getStore } from './get-store';
export { trackAsyncDataRequests } from './track-async-data';

export { setupEmberclearTest } from './setup-test';

export { refresh } from './refresh';
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
    let { owner } = getContext();

    owner.lookup<any>('router:main').setupRouter();
  });
}
