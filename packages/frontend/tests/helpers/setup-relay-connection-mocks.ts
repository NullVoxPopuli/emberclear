import { stubService } from './stub-service';

interface IMockServiceTarget {
  in: string;
  as: string;
}

export function stubConnection(overrides = {}, targets: IMockServiceTarget[] = []) {
  stubService('relay-manager', {
    getRelay() {},
    getOpenGraph() {},
    connect() {},
  });
  stubService('relay-connection', {
    setRelay() {},
    send() {},
    connect() {
      return;
    },
    ...overrides,
  });
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
