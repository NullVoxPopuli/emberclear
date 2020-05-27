import Worker, { method } from '@skyrocketjs/worker';

import {
  derivePublicKey,
  derivePublicSigningKey,
  generateAsymmetricKeys,
  generateSigningKeys,
  sign,
  openSigned,
  hash,
} from './utils/nacl';

import { decryptFromSocket, encryptForSocket } from './utils/socket';
import { mnemonicFromNaClBoxPrivateKey } from './utils/mnemonic';

import { login } from './actions';

export default class CryptoWorker extends Worker {
  @method
  decryptFromSocket(...args: Parameters<typeof decryptFromSocket>) {
    return decryptFromSocket(...args);
  }

  @method
  encryptForSocket(...args: Parameters<typeof encryptForSocket>) {
    return encryptForSocket(...args);
  }

  @method
  login(...args: Parameters<typeof login>) {
    return login(...args);
  }

  @method
  generateKeys(...args: Parameters<typeof generateAsymmetricKeys>) {
    return generateAsymmetricKeys(...args);
  }

  @method
  generateSigningKeys(...args: Parameters<typeof generateSigningKeys>) {
    return generateSigningKeys(...args);
  }

  @method
  sign(...args: Parameters<typeof sign>) {
    return sign(...args);
  }

  @method
  openSigned(...args: Parameters<typeof openSigned>) {
    return openSigned(...args);
  }

  @method
  hash(...args: Parameters<typeof hash>) {
    return hash(...args);
  }

  @method
  mnemonicFromPrivateKey(...args: Parameters<typeof mnemonicFromNaClBoxPrivateKey>) {
    return mnemonicFromNaClBoxPrivateKey(...args);
  }

  @method
  derivePublicKey(...args: Parameters<typeof derivePublicKey>) {
    return derivePublicKey(...args);
  }

  @method
  derivePublicSigningKey(...args: Parameters<typeof derivePublicSigningKey>) {
    return derivePublicSigningKey(...args);
  }
}
