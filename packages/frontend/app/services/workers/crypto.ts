import WorkersService from '../workers';
import { PWBHost } from 'promise-worker-bi';
import { SignMessage, OpenSignedMessage } from 'emberclear/workers/crypto/messages';

type GenerateKeys = import('emberclear/workers/crypto/messages').GenerateKeys;
type GenerateSigningKeys = import('emberclear/workers/crypto/messages').GenerateSigningKeys;
type EncryptForSocket = import('emberclear/workers/crypto/messages').EncryptForSocket;
type DecryptFromSocket = import('emberclear/workers/crypto/messages').DecryptFromSocket;
type DerivePublicKey = import('emberclear/workers/crypto/messages').DerivePublicKey;
type DerivePublicSigningKey = import('emberclear/workers/crypto/messages').DerivePublicSigningKey;

type Args = {
  workerService: WorkersService;
  keys?: KeyPair;
};

enum WorkerCryptoAction {
  LOGIN = 0,
  GENERATE_KEYS = 1,
  DECRYPT_FROM_SOCKET = 2,
  ENCRYPT_FOR_SOCKET = 3,
  GENERATE_SIGNING_KEYS = 4,
  SIGN_MESSAGE = 5,
  OPEN_SIGNED_MESSAGE = 6,
  // TODO: should find a way to not need these
  DERIVE_PUBLIC_KEY = 100,
  DERIVE_PUBLIC_SIGNING_KEY = 101,
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

  async generateKeys() {
    let worker = this.getWorker();

    return await worker.postMessage<KeyPair, GenerateKeys>({
      action: Action.GENERATE_KEYS,
      args: [],
    });
  }

  async generateSigningKeys() {
    let worker = this.getWorker();

    return await worker.postMessage<SigningKeyPair, GenerateSigningKeys>({
      action: Action.GENERATE_SIGNING_KEYS,
      args: [],
    });
  }

  async derivePublicKey(privateKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, DerivePublicKey>({
      action: Action.DERIVE_PUBLIC_KEY,
      args: [privateKey],
    });
  }

  async derivePublicSigningKey(privateSigningKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, DerivePublicSigningKey>({
      action: Action.DERIVE_PUBLIC_SIGNING_KEY,
      args: [privateSigningKey],
    });
  }

  async encryptForSocket(payload: RelayJson, { publicKey }: KeyPublic) {
    let worker = this.getWorker();

    return await worker.postMessage<KeyPair, EncryptForSocket>({
      action: Action.ENCRYPT_FOR_SOCKET,
      args: [payload, { publicKey }, { privateKey: this.keys.privateKey }],
    });
  }

  async decryptFromSocket(socketData: RelayMessage) {
    let worker = this.getWorker();

    return await worker.postMessage<KeyPair, DecryptFromSocket>({
      action: Action.DECRYPT_FROM_SOCKET,
      args: [socketData, this.keys.privateKey],
    });
  }

  async signMessage(message: Uint8Array, senderPrivateKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, SignMessage>({
      action: Action.SIGN_MESSAGE,
      args: [message, senderPrivateKey],
    });
  }

  async openSignedMessage(signedMessage: Uint8Array, senderPublicKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, OpenSignedMessage>({
      action: Action.OPEN_SIGNED_MESSAGE,
      args: [signedMessage, senderPublicKey],
    });
  }
}
