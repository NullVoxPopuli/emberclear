import { getContext } from '@ember/test-helpers';

import WindowService from 'emberclear/services/window';
import { clearLocalStorage } from './clear-local-storage';
import { setupWorkers } from './setup-workers';
import { setupRelayConnectionMocks } from './setup-relay-connection-mocks';

export function setupEmberclearTest(hooks: NestedHooks) {
  clearLocalStorage(hooks);
  setupWorkers(hooks);
  setupRelayConnectionMocks(hooks);
  setupWindow(hooks);
}

//////////////////////////////////

function setupWindow(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    class TestWindow extends WindowService {
      get location(): any {
        return {
          href: '',
        };
      }
    }

    getContext().owner.register('service:window', TestWindow);
  });
}
