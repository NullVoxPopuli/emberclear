import { stubService } from './stub-service';

export function stubConnection(overrides = {}) {
  stubService('connection', {
    getOpenGraph() {},
    connect() {},
    disconnect() {},
    send() {},
    ...overrides,
  });
  stubService('connection/manager', {
    setup() {},
    acquire() {},
    getOpenGraph() {},
    disconnect() {},
    updateStatus() {},
    createConnection() {},
    connectionPool: {
      activeConnections: [],
    },
  });
}

export function setupRelayConnectionMocks(hooks: NestedHooks, overrides = {}) {
  hooks.beforeEach(function () {
    stubConnection(overrides);
  });
}
