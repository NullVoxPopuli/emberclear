import { derivePublicKey, generateAsymmetricKeys } from './utils/nacl';
import { decryptFromSocket, encryptForSocket } from './utils/socket';
import { login } from './actions';

enum WorkerCryptoAction {
  LOGIN = 0, // TODO: figure this out
  GENERATE_KEYS = 1,
  DECRYPT_FROM_SOCKET = 2,
  ENCRYPT_FOR_SOCKET = 3,
  // TODO: should find a way to not need these
  DERIVE_PUBLIC_KEY = 100,
}

export type Login = {
  action: WorkerCryptoAction.LOGIN;
  args: Parameters<typeof login>;
};
export type GenerateKeys = {
  action: WorkerCryptoAction.GENERATE_KEYS;
  args: Parameters<typeof generateAsymmetricKeys>;
};
export type DecryptFromSocket = {
  action: WorkerCryptoAction.DECRYPT_FROM_SOCKET;
  args: Parameters<typeof decryptFromSocket>;
};
export type EncryptForSocket = {
  action: WorkerCryptoAction.ENCRYPT_FOR_SOCKET;
  args: Parameters<typeof encryptForSocket>;
};
export type DerivePublicKey = {
  action: WorkerCryptoAction.DERIVE_PUBLIC_KEY;
  args: Parameters<typeof derivePublicKey>;
};

export type CryptoMessage =
  | Login
  | GenerateKeys
  | DecryptFromSocket
  | EncryptForSocket
  | DerivePublicKey;

export function handleMessage(message: CryptoMessage) {
  switch (message.action) {
    case WorkerCryptoAction.GENERATE_KEYS:
      return generateAsymmetricKeys();
    case WorkerCryptoAction.DECRYPT_FROM_SOCKET:
      return decryptFromSocket(...message.args);
    case WorkerCryptoAction.ENCRYPT_FOR_SOCKET:
      return encryptForSocket(...message.args);
    case WorkerCryptoAction.DERIVE_PUBLIC_KEY:
      return derivePublicKey(...message.args);
    default:
      throw new Error(`unknown message for crypto worker: ${(message as any).action}`);
  }
}
