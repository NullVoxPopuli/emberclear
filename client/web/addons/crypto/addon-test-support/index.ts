import { getContext } from '@ember/test-helpers';

import { CryptoConnector } from '@emberclear/crypto';
import { toHex } from '@emberclear/crypto/workers/crypto/utils/string-encoding';

import type { WorkersService } from '@emberclear/crypto';
import type { TestContext } from 'ember-test-helpers';

export { setupWorkers } from './setup';

// no one use this!
// prettier-ignore
export const samplePrivateKey = Uint8Array.from([
  43, 191, 106, 38, 141, 42, 151, 128,
  227, 93, 124, 214, 166, 222, 144, 176,
  162, 181, 203, 27, 39, 18, 37, 173,
  2, 189, 139, 8, 181, 8, 171, 45
]);

export async function newCrypto() {
  const workers = (getContext() as TestContext).owner.lookup('service:workers') as WorkersService;
  const crypto = new CryptoConnector({ workerService: workers });

  let { publicKey, privateKey } = await crypto.generateKeys();

  return {
    publicKey,
    privateKey,
    hex: {
      publicKey: toHex(publicKey),
      privateKey: toHex(privateKey),
    },
    crypto,
  };
}
