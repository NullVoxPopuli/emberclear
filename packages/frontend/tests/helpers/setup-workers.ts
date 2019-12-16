import { TestContext } from 'ember-test-helpers';
import WorkersService, { CRYPTO_PATH } from 'emberclear/services/workers';
import { handleMessage } from 'emberclear/workers/crypto/messages';

type CryptoMessage = import('emberclear/workers/crypto/messages').CryptoMessage;

/**
 *
 * in a test environment, we can't assume a stable connection
 * to the internet.
 *
 * even though the test index.html and web workers live on the same
 * host, the tests freak out when the internet connection is interrupted.
 */
export function setupWorkers(hooks: NestedHooks) {
  hooks.beforeEach(function(this: TestContext) {
    class WorkersProxy extends WorkersService {
      getWorker(path: string) {
        switch (path) {
          case CRYPTO_PATH:
            return fakeCrypto as any;
          default:
            throw new Error(`No worker proxy exists for worker: ${path}`);
        }
      }
    }

    this.owner.register('service:workers', WorkersProxy);
  });
}

const fakeCrypto = {
  async postMessage(message: CryptoMessage) {
    return handleMessage(message);
  },
};
