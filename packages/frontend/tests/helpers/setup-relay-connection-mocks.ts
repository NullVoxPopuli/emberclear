import { stubService } from './stub-service';

interface IMockServiceTarget {
  in: string;
  as: string;
}

export function setupRelayConnectionMocks(
  hooks: NestedHooks,
  overrides = {},
  targets: IMockServiceTarget[] = []
) {
  hooks.beforeEach(function () {
    stubService('relay-connection', {
      connect() { return; },
      ...overrides
    }, [
      { in: 'route:application', as: 'relayConnection' },
      { in: 'route:chat', as: 'relayConnection' },
      ...targets,
    ]);
  });
}
