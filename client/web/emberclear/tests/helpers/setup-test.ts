import WindowService from 'emberclear/services/window';

import { clearLocalStorage } from './clear-local-storage';
import { setupRelayConnectionMocks } from './setup-relay-connection-mocks';
import { setupWorkers } from './setup-workers';

import type { TestContext } from 'ember-test-helpers';

export function setupEmberclearTest(hooks: NestedHooks) {
  clearLocalStorage(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);
  setupWindow(hooks);
}

//////////////////////////////////

function setupWindow(hooks: NestedHooks) {
  hooks.beforeEach(function (this: TestContext) {
    class TestWindow extends WindowService {
      get location(): any {
        return {
          href: '',
        };
      }
    }

    this.owner.register('service:window', TestWindow);
  });
}
