// import a11yAuditIf from 'ember-a11y-testing/test-support/audit-if';
import { percySnapshot } from 'ember-percy';

export { clearLocalStorage } from './clear-local-storage';
export { getService } from './get-service';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { setupEmberclearTest } from './setup-test';
export { stubService } from './stub-service';
export { trackAsyncDataRequests } from './track-async-data';
export { waitUntilTruthy } from './waitUntilTruthy';

export function assertExternal(assert: any) {
  percySnapshot(assert);
  // a11yAuditIf();
}
