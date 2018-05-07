import _libsodium from 'libsodium-wrappers';

import { ensureUint8Array } from 'emberclear/src/utils/string-encoding';
import { concat } from 'emberclear/src/utils/arrays/utils';

export async function libsodium(): Promise<ISodium> {
  await _libsodium.ready;

  return _libsodium;
}

// _libsodium.crypto_box_NONCEBYTES;
const NONCE_BYTES = 24;


export async function generateNewKeys(): Promise<BoxKeys> {
  const sodium = await libsodium();

  return sodium.crypto_box_keypair();
}

export async function encryptFor(msg: BoxInput, theirPublicKey: Key, myPrivateKey: Key): Promise<Uint8Array> {
  const message = await ensureUint8Array(msg);
  const publicKey = await ensureUint8Array(theirPublicKey);
  const privateKey = await ensureUint8Array(myPrivateKey);

  return encrypt(message, publicKey, privateKey);
}

export async function decryptFrom(msg: BoxInput, theirPublicKey: Key, myPrivateKey: Key) {
  const message = await ensureUint8Array(msg);
  const publicKey = await ensureUint8Array(theirPublicKey);
  const privateKey = await ensureUint8Array(myPrivateKey);

  return decrypt(message, publicKey, privateKey);
}

export async function encrypt(messageWithoutNonce: Uint8Array, theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Promise<Uint8Array> {
  const sodium = await libsodium();
  const nonce = sodium.randombytes_buf(NONCE_BYTES);

  const box = sodium.crypto_box_seal(messageWithoutNonce, theirPublicKey);

  return concat(nonce, box);
}


export async function decrypt(messageWithNonce: Uint8Array, theirPublicKey: Uint8Array, mySecretKey: Uint8Array): Promise<Uint8Array | undefined> {
  const sodium = await libsodium();

  const [, message] = splitNonceFromMessage(messageWithNonce);
  const decrypted = sodium.crypto_box_seal_open(message, theirPublicKey, mySecretKey);

  return decrypted;
}

export function splitNonceFromMessage(messageWithNonce: Uint8Array): [Uint8Array, Uint8Array] {
  const nonce = messageWithNonce.slice(0, NONCE_BYTES);
  const message = messageWithNonce.slice(NONCE_BYTES, messageWithNonce.length);

  return [nonce, message];
}
