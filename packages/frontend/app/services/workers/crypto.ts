import WorkersService from '../workers';
import { PWBHost } from 'promise-worker-bi';

type CryptoMessage = import('emberclear/workers/crypto').Login;
type Login = import('emberclear/workers/crypto').Login;
type GenerateKeys = import('emberclear/workers/crypto').GenerateKeys;
type EncryptForSocket = import('emberclear/workers/crypto').EncryptForSocket;
type DecryptFromSocket = import('emberclear/workers/crypto').DecryptFromSocket;
type DerivePublicKey = import('emberclear/workers/crypto').DerivePublicKey;

type Args = {
  workerService: WorkersService;
  keys?: KeyPair;
};

enum WorkerCryptoAction {
  LOGIN = 0,
  GENERATE_KEYS = 1,
  DECRYPT_FROM_SOCKET = 2,
  ENCRYPT_FOR_SOCKET = 3,
  // TODO: should find a way to not need these
  DERIVE_PUBLIC_KEY = 100,
}

const Action = WorkerCryptoAction;

export default class CryptoConnector {
  getWorker: () => PWBHost;
  keys: KeyPair;

  constructor({ workerService, keys }: Args) {
    let { privateKey, publicKey } = keys || ({} as KeyPair);
    this.getWorker = workerService.getCryptoWorker;
    this.keys = { privateKey, publicKey };
  }

  async login(...args: Login['args']) {
    let worker = await this.getWorker();

    return await worker.postMessage<KeyPublic, CryptoMessage>({
      action: Action.LOGIN,
      args,
    });
  }

  async generateKeys() {
    let worker = await this.getWorker();

    return await worker.postMessage<KeyPair, GenerateKeys>({
      action: Action.GENERATE_KEYS,
      args: [],
    });
  }

  async derivePublicKey(privateKey: Uint8Array) {
    let worker = await this.getWorker();

    return await worker.postMessage<Uint8Array, DerivePublicKey>({
      action: Action.DERIVE_PUBLIC_KEY,
      args: [privateKey],
    });
  }

  async encryptForSocket(payload: RelayJson, { publicKey }: KeyPublic) {
    let worker = await this.getWorker();

    return await worker.postMessage<KeyPair, EncryptForSocket>({
      action: Action.ENCRYPT_FOR_SOCKET,
      args: [payload, { publicKey }, { privateKey: this.keys.privateKey }],
    });
  }

  async decryptFromSocket(socketData: RelayMessage) {
    let worker = await this.getWorker();

    return await worker.postMessage<KeyPair, DecryptFromSocket>({
      action: Action.DECRYPT_FROM_SOCKET,
      args: [socketData, this.keys.privateKey],
    });
  }
}
