import { stubService } from './stub-service';

export function stubConnection(overrides = {}) {
  stubService('connection/status', {
    isConnected: true,
  });
  stubService('connection', {
    getOpenGraph() {},
    connect() {},
    disconnect() {},
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
