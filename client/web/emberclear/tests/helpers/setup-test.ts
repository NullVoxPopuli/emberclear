import { getContext } from '@ember/test-helpers';

import WindowService from 'emberclear/services/window';
import { clearLocalStorage } from './clear-local-storage';
import { setupRelayConnectionMocks } from './setup-relay-connection-mocks';

export function setupEmberclearTest(hooks: NestedHooks) {
  clearLocalStorage(hooks);
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
