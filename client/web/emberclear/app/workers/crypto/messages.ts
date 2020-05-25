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
import { login } from './actions';
import { mnemonicFromNaClBoxPrivateKey } from './utils/mnemonic';

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

export type Login = {
  action: WorkerCryptoAction.LOGIN;
  args: Parameters<typeof login>;
};
export type MnemonicFromPrivateKey = {
  action: WorkerCryptoAction.MNEMONIC_FROM_PRIVATE_KEY;
  args: Parameters<typeof mnemonicFromNaClBoxPrivateKey>;
};
export type GenerateKeys = {
  action: WorkerCryptoAction.GENERATE_KEYS;
  args: Parameters<typeof generateAsymmetricKeys>;
};
export type GenerateSigningKeys = {
  action: WorkerCryptoAction.GENERATE_SIGNING_KEYS;
  args: Parameters<typeof generateSigningKeys>;
};
export type DecryptFromSocket = {
  action: WorkerCryptoAction.DECRYPT_FROM_SOCKET;
  args: Parameters<typeof decryptFromSocket>;
};
export type EncryptForSocket = {
  action: WorkerCryptoAction.ENCRYPT_FOR_SOCKET;
  args: Parameters<typeof encryptForSocket>;
};
export type Sign = {
  action: WorkerCryptoAction.SIGN;
  args: Parameters<typeof sign>;
};
export type OpenSigned = {
  action: WorkerCryptoAction.OPEN_SIGNED;
  args: Parameters<typeof openSigned>;
};
export type Hash = {
  action: WorkerCryptoAction.HASH;
  args: Parameters<typeof hash>;
};
export type DerivePublicKey = {
  action: WorkerCryptoAction.DERIVE_PUBLIC_KEY;
  args: Parameters<typeof derivePublicKey>;
};
export type DerivePublicSigningKey = {
  action: WorkerCryptoAction.DERIVE_PUBLIC_SIGNING_KEY;
  args: Parameters<typeof derivePublicSigningKey>;
};

export type CryptoMessage =
  | Login
  | GenerateKeys
  | GenerateSigningKeys
  | DecryptFromSocket
  | EncryptForSocket
  | MnemonicFromPrivateKey
  | DerivePublicKey
  | DerivePublicSigningKey
  | Sign
  | OpenSigned
  | Hash;

export function handleMessage(message: CryptoMessage) {
  switch (message.action) {
    case WorkerCryptoAction.LOGIN:
      return login(...message.args);
    case WorkerCryptoAction.GENERATE_KEYS:
      return generateAsymmetricKeys();
    case WorkerCryptoAction.GENERATE_SIGNING_KEYS:
      return generateSigningKeys();
    case WorkerCryptoAction.DECRYPT_FROM_SOCKET:
      return decryptFromSocket(...message.args);
    case WorkerCryptoAction.ENCRYPT_FOR_SOCKET:
      return encryptForSocket(...message.args);
    case WorkerCryptoAction.SIGN:
      return sign(...message.args);
    case WorkerCryptoAction.OPEN_SIGNED:
      return openSigned(...message.args);
    case WorkerCryptoAction.HASH:
      return hash(...message.args);
    case WorkerCryptoAction.DERIVE_PUBLIC_KEY:
      return derivePublicKey(...message.args);
    case WorkerCryptoAction.DERIVE_PUBLIC_SIGNING_KEY:
      return derivePublicSigningKey(...message.args);
    case WorkerCryptoAction.MNEMONIC_FROM_PRIVATE_KEY:
      return mnemonicFromNaClBoxPrivateKey(...message.args);
    default:
      throw new Error(`unknown message for crypto worker: ${(message as any).action}`);
  }
}
