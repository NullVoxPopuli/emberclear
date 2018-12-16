import * as nacl from 'tweetnacl';

import { concat } from '../utils';

export function generateAsymmetricKeys() {
  return nacl.box.keyPair();
}

export function generateNonce(): Uint8Array {
  return nacl.randomBytes(nacl.secretbox.nonceLength);
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
  const box = nacl.box(ciphertext, nonce, senderPublicKey, recipientPrivateKey);
  const decrypted = nacl.box.open(box, nonce, senderPublicKey, recipientPrivateKey);

  return decrypted as Uint8Array;
}


export function splitNonceFromMessage(
  messageWithNonce: Uint8Array
): [Uint8Array, Uint8Array] {
  const bytes = nacl.secretbox.nonceLength;

  const nonce = messageWithNonce.slice(0, bytes);
  const message = messageWithNonce.slice(bytes, messageWithNonce.length);

  return [nonce, message];
}
