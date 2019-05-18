import DS from 'ember-data';

import { getService } from './get-service';

export function trackAsyncDataRequests(hooks: NestedHooks) {
  hooks.beforeEach(function() {
    const store = getService<DS.Store>('store');

    store.generateStackTracesForTrackedRequests = true;
    store.shouldTrackAsyncRequests = true;
  });
}
