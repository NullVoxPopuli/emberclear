import type { WorkersService } from '@emberclear/crypto';
import type { WorkerLike } from '@emberclear/crypto/-private/types';
import type { EncryptedMessage, KeyPair, KeyPublic } from '@emberclear/crypto/types';

type Args = {
  workerService: WorkersService;
  keys?: KeyPair;
};

enum WorkerCryptoAction {
  // Generation
  LOGIN = 0,
  GENERATE_KEYS = 1,
  DECRYPT_FROM_SOCKET = 2,
  ENCRYPT_FOR_SOCKET = 3,
  GENERATE_SIGNING_KEYS = 4,
  SIGN = 5,
  OPEN_SIGNED = 6,
  HASH = 7,

  // Conversions
  MNEMONIC_FROM_PRIVATE_KEY = 50,

  // TODO: should find a way to not need these
  DERIVE_PUBLIC_KEY = 100,
  DERIVE_PUBLIC_SIGNING_KEY = 101,
}

const Action = WorkerCryptoAction;

export default class CryptoConnector {
  getWorker: () => WorkerLike;
  keys: KeyPair;

  constructor({ workerService, keys }: Args) {
    let { privateKey, publicKey } = keys || ({} as KeyPair);

    this.getWorker = workerService.getCryptoWorker;
    this.keys = { privateKey, publicKey };
  }

  async login(mnemonic: string) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.LOGIN,
      args: [mnemonic],
    });
  }

  async mnemonicFromNaClBoxPrivateKey(key?: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.MNEMONIC_FROM_PRIVATE_KEY,
      args: [key || this.keys.publicKey],
    });
  }

  async generateKeys() {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.GENERATE_KEYS,
      args: [],
    });
  }

  async generateSigningKeys() {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.GENERATE_SIGNING_KEYS,
      args: [],
    });
  }

  async derivePublicKey(privateKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.DERIVE_PUBLIC_KEY,
      args: [privateKey],
    });
  }

  async derivePublicSigningKey(privateSigningKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.DERIVE_PUBLIC_SIGNING_KEY,
      args: [privateSigningKey],
    });
  }


  async encryptForSocket(payload: Json, { publicKey }: KeyPublic) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.ENCRYPT_FOR_SOCKET,
      args: [payload, { publicKey }, { privateKey: this.keys.privateKey }],
    });
  }

  async decryptFromSocket<ExpectedReturn = unknown>(socketData: EncryptedMessage) {
    let worker = this.getWorker();

    return (await worker.postMessage({
      action: Action.DECRYPT_FROM_SOCKET,
      args: [socketData, this.keys.privateKey],
    })) as Promise<ExpectedReturn>;
  }

  async sign(message: Uint8Array, senderPrivateKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.SIGN,
      args: [message, senderPrivateKey],
    });
  }

  async openSigned(signedMessage: Uint8Array, senderPublicKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.OPEN_SIGNED,
      args: [signedMessage, senderPublicKey],
    });
  }

  async hash(message: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage({
      action: Action.HASH,
      args: [message],
    });
  }
}
