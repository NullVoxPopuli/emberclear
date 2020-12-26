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

const Action = {
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
  [Action.LOGIN]: typeof login;
  [Action.GENERATE_KEYS]: typeof generateAsymmetricKeys;
  [Action.GENERATE_SIGNING_KEYS]: typeof generateSigningKeys;
  [Action.DECRYPT_FROM_SOCKET]: typeof decryptFromSocket;
  [Action.ENCRYPT_FOR_SOCKET]: typeof encryptForSocket;
  [Action.SIGN]: typeof sign;
  [Action.OPEN_SIGNED]: typeof openSigned;
  [Action.HASH]: typeof hash;
  [Action.DERIVE_PUBLIC_KEY]: typeof derivePublicKey;
  [Action.DERIVE_PUBLIC_SIGNING_KEY]: typeof derivePublicSigningKey;
  [Action.MNEMONIC_FROM_PRIVATE_KEY]: typeof mnemonicFromNaClBoxPrivateKey;
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
    case Action.LOGIN:
      return (login as TODO)(...args);
    case Action.GENERATE_KEYS:
      return (generateAsymmetricKeys as TODO)();
    case Action.GENERATE_SIGNING_KEYS:
      return (generateSigningKeys as TODO)();
    case Action.DECRYPT_FROM_SOCKET:
      return (decryptFromSocket as TODO)(...args);
    case Action.ENCRYPT_FOR_SOCKET:
      return (encryptForSocket as TODO)(...args);
    case Action.SIGN:
      return (sign as TODO)(...args);
    case Action.OPEN_SIGNED:
      return (openSigned as TODO)(...args);
    case Action.HASH:
      return (hash as TODO)(...args);
    case Action.DERIVE_PUBLIC_KEY:
      return (derivePublicKey as TODO)(...args);
    case Action.DERIVE_PUBLIC_SIGNING_KEY:
      return (derivePublicSigningKey as TODO)(...args);
    case Action.MNEMONIC_FROM_PRIVATE_KEY:
      return (mnemonicFromNaClBoxPrivateKey as TODO)(...args);
    default:
      throw new Error(`unknown message for crypto worker: ${action}`);
  }
}
