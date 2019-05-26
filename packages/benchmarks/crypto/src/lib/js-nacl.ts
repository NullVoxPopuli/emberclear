
import NaClFactory, { Nacl } from 'js-nacl';

import { concat } from '../utils';


export let nacl: Nacl;
export function setInstance(): Promise<Nacl> {
  return new Promise((resolve, reject) => {
    // These apis are.... not good
    NaClFactory.instantiate((instance: Nacl) => {
      nacl = instance;
      resolve(nacl);
    });
  });
}

export function generateAsymmetricKeys() {
  return nacl.crypto_box_keypair();
}

export function generateNonce(): Uint8Array {
  return nacl.crypto_box_random_nonce();
}

export function encryptFor(
  message: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array
): Uint8Array {
  const nonce = generateNonce();

  const ciphertext = nacl.crypto_box(message, nonce, recipientPublicKey, senderPrivateKey);

  return concat(nonce, ciphertext);
}

export function decryptFrom(
  ciphertextWithNonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
): Uint8Array {
  const [nonce, ciphertext] = splitNonceFromMessage(ciphertextWithNonce);
  const decrypted = nacl.crypto_box_open(ciphertext, nonce, senderPublicKey, recipientPrivateKey);

  return decrypted as Uint8Array;
}


export function splitNonceFromMessage(
  messageWithNonce: Uint8Array
): [Uint8Array, Uint8Array] {
  const bytes = nacl.crypto_box_NONCEBYTES;

  const nonce = messageWithNonce.slice(0, bytes);
  const message = messageWithNonce.slice(bytes, messageWithNonce.length);

  return [nonce, message];
}
