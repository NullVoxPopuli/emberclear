import WorkersService from '../workers';
import { PWBHost } from 'promise-worker-bi';
import { Sign, OpenSigned, Hash } from 'emberclear/workers/crypto/messages';

type Login = import('emberclear/workers/crypto/messages').Login;
type MnemonicFromPrivateKey = import('emberclear/workers/crypto/messages').MnemonicFromPrivateKey;
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
  getWorker: () => PWBHost;
  keys: KeyPair;

  constructor({ workerService, keys }: Args) {
    let { privateKey, publicKey } = keys || ({} as KeyPair);
    this.getWorker = workerService.getCryptoWorker;
    this.keys = { privateKey, publicKey };
  }

  async login(mnemonic: string) {
    let worker = this.getWorker();

    return await worker.postMessage<KeyPair & SigningKeyPair, Login>({
      action: Action.LOGIN,
      args: [mnemonic],
    });
  }

  async mnemonicFromNaClBoxPrivateKey(key?: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<string, MnemonicFromPrivateKey>({
      action: Action.MNEMONIC_FROM_PRIVATE_KEY,
      args: [key || this.keys.publicKey],
    });
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

    return await worker.postMessage<string, EncryptForSocket>({
      action: Action.ENCRYPT_FOR_SOCKET,
      args: [payload, { publicKey }, { privateKey: this.keys.privateKey }],
    });
  }

  async decryptFromSocket<ExpectedReturn = any>(socketData: RelayMessage) {
    let worker = this.getWorker();

    return await worker.postMessage<ExpectedReturn, DecryptFromSocket>({
      action: Action.DECRYPT_FROM_SOCKET,
      args: [socketData, this.keys.privateKey],
    });
  }

  async sign(message: Uint8Array, senderPrivateKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, Sign>({
      action: Action.SIGN,
      args: [message, senderPrivateKey],
    });
  }

  async openSigned(signedMessage: Uint8Array, senderPublicKey: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, OpenSigned>({
      action: Action.OPEN_SIGNED,
      args: [signedMessage, senderPublicKey],
    });
  }

  async hash(message: Uint8Array) {
    let worker = this.getWorker();

    return await worker.postMessage<Uint8Array, Hash>({
      action: Action.HASH,
      args: [message],
    });
  }
}
