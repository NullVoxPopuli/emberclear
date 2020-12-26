import { getStore } from '@emberclear/test-helpers/test-support';

export function trackAsyncDataRequests(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    const store = getStore();

    (store as any).generateStackTracesForTrackedRequests = true;
    (store as any).shouldTrackAsyncRequests = true;
  });
}
