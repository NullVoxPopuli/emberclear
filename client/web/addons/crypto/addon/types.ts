export type KeyPublic = { publicKey: Uint8Array };
export type KeyPrivate = { privateKey: Uint8Array };
export type KeyPair = KeyPublic & KeyPrivate;

export type SigningKeyPublic = { publicSigningKey: Uint8Array };
export type SigningKeyPrivate = { privateSigningKey: Uint8Array };
export type SigningKeyPair = SigningKeyPublic & SigningKeyPrivate;

export interface EncryptedMessage {
  // recipient
  uid: string;
  // ciphertext
  message: string;
}

export type Serializable =
  | string
  | number
  | boolean
  | Date
  | Serializable[]
  | { [key: string]: Serializable };

export type EncryptableObject = Record<string, Serializable>;
