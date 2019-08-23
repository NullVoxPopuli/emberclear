import { stubService } from './stub-service';

export function stubConnection(overrides = {}) {
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

export function setupRelayConnectionMocks(hooks: NestedHooks, overrides = {}) {
  hooks.beforeEach(function() {
    stubConnection(overrides);
  });
}
