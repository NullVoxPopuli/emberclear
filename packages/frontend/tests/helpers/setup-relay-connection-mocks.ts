import { stubService } from './stub-service';

export function stubConnection(overrides = {}) {
  stubService('connection', {
    getOpenGraph() {},
    connect() {},
    send() {},
    ...overrides,
  });
  stubService('connection/manager', {
    connectionPool: {
      activeConnections: [],
    },
  });
}

export function setupRelayConnectionMocks(hooks: NestedHooks, overrides = {}) {
  hooks.beforeEach(function() {
    stubConnection(overrides);
  });
}
