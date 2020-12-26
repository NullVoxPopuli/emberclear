import { getContext } from '@ember/test-helpers';

import type { TestContext } from 'ember-test-helpers';

export function setupRouter(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    let { owner } = getContext() as TestContext;

    // eslint-disable-next-line ember/no-private-routing-service
    owner.lookup('router:main').setupRouter();
  });
}
