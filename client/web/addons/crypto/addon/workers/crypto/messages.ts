import { login } from './actions';
import { mnemonicFromNaClBoxPrivateKey } from './utils/mnemonic';
import {
  derivePublicKey,
  derivePublicSigningKey,
  generateAsymmetricKeys,
  generateSigningKeys,
  hash,
  openSigned,
  sign,
} from './utils/nacl';
import { decryptFromSocket, encryptForSocket } from './utils/socket';

const WorkerCryptoAction = {
  // Generation
  LOGIN: 0,
  GENERATE_KEYS: 1,
  DECRYPT_FROM_SOCKET: 2,
  ENCRYPT_FOR_SOCKET: 3,
  GENERATE_SIGNING_KEYS: 4,
  SIGN: 5,
  OPEN_SIGNED: 6,
  HASH: 7,

  // Conversions
  MNEMONIC_FROM_PRIVATE_KEY: 50,

  // TODO: should find a way to not need these
  DERIVE_PUBLIC_KEY: 100,
  DERIVE_PUBLIC_SIGNING_KEY: 101,
} as const;

export type API = {
  [WorkerCryptoAction.LOGIN]: typeof login;
  [WorkerCryptoAction.GENERATE_KEYS]: typeof generateAsymmetricKeys;
  [WorkerCryptoAction.GENERATE_SIGNING_KEYS]: typeof generateSigningKeys;
  [WorkerCryptoAction.DECRYPT_FROM_SOCKET]: typeof decryptFromSocket;
  [WorkerCryptoAction.ENCRYPT_FOR_SOCKET]: typeof encryptForSocket;
  [WorkerCryptoAction.SIGN]: typeof sign;
  [WorkerCryptoAction.OPEN_SIGNED]: typeof openSigned;
  [WorkerCryptoAction.HASH]: typeof hash;
  [WorkerCryptoAction.DERIVE_PUBLIC_KEY]: typeof derivePublicKey;
  [WorkerCryptoAction.DERIVE_PUBLIC_SIGNING_KEY]: typeof derivePublicSigningKey;
  [WorkerCryptoAction.MNEMONIC_FROM_PRIVATE_KEY]: typeof mnemonicFromNaClBoxPrivateKey;
};

export type CryptoMessage = {
  action: keyof API;
  args: Parameters<API[keyof API]>;
};

export type Message<Action, Args> = { action: Action; args: Args };

export function handleMessage<Action extends keyof API>(
  message: Message<Action, Parameters<API[Action]>>
): ReturnType<API[Action]> {
  const { action, args } = message as TODO;

  switch (action) {
    case WorkerCryptoAction.LOGIN:
      return (login as TODO)(action, ...args);
    case WorkerCryptoAction.GENERATE_KEYS:
      return (generateAsymmetricKeys as TODO)();
    case WorkerCryptoAction.GENERATE_SIGNING_KEYS:
      return (generateSigningKeys as TODO)();
    case WorkerCryptoAction.DECRYPT_FROM_SOCKET:
      return (decryptFromSocket as TODO)(...args);
    case WorkerCryptoAction.ENCRYPT_FOR_SOCKET:
      return (encryptForSocket as TODO)(...args);
    case WorkerCryptoAction.SIGN:
      return (sign as TODO)(...args);
    case WorkerCryptoAction.OPEN_SIGNED:
      return (openSigned as TODO)(...args);
    case WorkerCryptoAction.HASH:
      return (hash as TODO)(...args);
    case WorkerCryptoAction.DERIVE_PUBLIC_KEY:
      return (derivePublicKey as TODO)(...args);
    case WorkerCryptoAction.DERIVE_PUBLIC_SIGNING_KEY:
      return (derivePublicSigningKey as TODO)(...args);
    case WorkerCryptoAction.MNEMONIC_FROM_PRIVATE_KEY:
      return (mnemonicFromNaClBoxPrivateKey as TODO)(...args);
    default:
      throw new Error(`unknown message for crypto worker: ${action}`);
  }
}
