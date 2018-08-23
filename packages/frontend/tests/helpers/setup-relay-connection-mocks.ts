import { stubService } from './stub-service';

export function setupRelayConnectionMocks(hooks: NestedHooks) {
  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; }
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' }
    ]);
  });
}
