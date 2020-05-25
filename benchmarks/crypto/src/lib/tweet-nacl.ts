import * as nacl from 'tweetnacl';
import * as utils from 'tweetnacl-util';

import { concat } from '../utils';

export function generateAsymmetricKeys() {
  return nacl.box.keyPair();
}

export function generateNonce(): Uint8Array {
  return nacl.randomBytes(nacl.box.nonceLength);
}

export function encryptFor(
  message: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array
): Uint8Array {

  const nonce = generateNonce();

  const ciphertext = nacl.box(message, nonce, recipientPublicKey, senderPrivateKey);

  return concat(nonce, ciphertext);
}

export function decryptFrom(
  ciphertextWithNonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
): Uint8Array {

  const [nonce, ciphertext] = splitNonceFromMessage(ciphertextWithNonce);
  const decrypted = nacl.box.open(ciphertext, nonce, senderPublicKey, recipientPrivateKey);

  return decrypted as Uint8Array;
}


export function splitNonceFromMessage(
  messageWithNonce: Uint8Array
): [Uint8Array, Uint8Array] {
  const bytes = nacl.box.nonceLength;

  const nonce = messageWithNonce.slice(0, bytes);
  const message = messageWithNonce.slice(bytes, messageWithNonce.length);

  return [nonce, message];
}

// export function toHex(array: Uint8Array): string {
//   return libsodiumWrapper.to_hex(array);
// }

// export function fromHex(hex: string): Uint8Array {
//   return libsodiumWrapper.from_hex(hex);
// }

export async function toBase64(array: Uint8Array): Promise<string> {
  return utils.encodeBase64(array);
}

export async function fromBase64(base64: string): Promise<Uint8Array> {
  return utils.decodeBase64(base64);
}

export function fromString(str: string): Uint8Array {
  return utils.decodeUTF8(str);
}

export const toUint8Array = fromString;

export function toString(uint8Array: Uint8Array): string {
  return utils.encodeUTF8(uint8Array);
}

