import { visit as dangerousVisit } from '@ember/test-helpers';

export { stubService } from './stub-service';
export { textFor } from './text-for';
export { createCurrentUser, setupCurrentUser } from './create-current-user';
export { getService } from './get-service';
export { clearLocalStorage } from './clear-local-storage';
export { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
export { getStore } from './get-store';
export { trackAsyncDataRequests } from './track-async-data';
export { cancelLongRunningTimers } from './cancel-long-running-timers';


export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    console.error(e);
  }
}
