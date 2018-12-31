import { stubService } from './stub-service';

interface IMockServiceTarget {
  in: string;
  as: string;
}

export function stubConnection(overrides = {}, targets: IMockServiceTarget[] = []) {
  stubService(
    'relay-manager',
    {
      getRelay() {},
      getOpenGraph() {},
      connect() {},
    },
    [{ in: 'route:application', as: 'relayManager' }, { in: 'route:chat', as: 'relayManager' }]
  );
  stubService(
    'relay-connection',
    {
      setRelay() {},
      connect() {
        return;
      },
      ...overrides,
    },
    [{ in: 'service:relay-manager', as: 'relayConnection' }, ...targets]
  );
}

export function setupRelayConnectionMocks(
  hooks: NestedHooks,
  overrides = {},
  targets: IMockServiceTarget[] = []
) {
  hooks.beforeEach(function() {
    stubConnection(overrides, targets);
  });
}
