import libsodiumWrapper, { KeyPair } from 'libsodium-wrappers';

import { concat } from 'emberclear/src/utils/arrays/utils';

export async function libsodium(): Promise<typeof libsodiumWrapper> {
  const sodium = (libsodiumWrapper as any).sodium;
  await sodium.ready;

  return sodium as typeof libsodiumWrapper;
}

export async function genericHash(arr: Uint8Array): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.crypto_generichash(32, arr);
}

export async function derivePublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.crypto_scalarmult_base(privateKey);
}

export async function randomBytes(length: number): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.randombytes_buf(length);
}

export async function generateNonce(): Promise<Uint8Array> {
  const sodium = await libsodium();

  return await randomBytes(sodium.crypto_box_NONCEBYTES);
}

export async function generateAsymmetricKeys(): Promise<KeyPair> {
  const sodium = await libsodium();

  return sodium.crypto_box_keypair();
}

export async function generateSymmetricKey(): Promise<Uint8Array> {
  const sodium = await libsodium();

  return await randomBytes(sodium.crypto_box_SECRETKEYBYTES);
}

export async function encryptFor(
  message: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array
): Promise<Uint8Array> {
  const sodium = await libsodium();
  const nonce = await generateNonce();

  const ciphertext = sodium.crypto_box_easy(message, nonce, recipientPublicKey, senderPrivateKey);

  return concat(nonce, ciphertext);
}

export async function decryptFrom(
  ciphertextWithNonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
): Promise<Uint8Array> {
  const sodium = await libsodium();

  const [nonce, ciphertext] = await splitNonceFromMessage(ciphertextWithNonce);
  const decrypted = sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    senderPublicKey,
    recipientPrivateKey
  );

  return decrypted;
}

export async function splitNonceFromMessage(
  messageWithNonce: Uint8Array
): Promise<[Uint8Array, Uint8Array]> {
  const sodium = await libsodium();
  const bytes = sodium.crypto_box_NONCEBYTES;

  const nonce = messageWithNonce.slice(0, bytes);
  const message = messageWithNonce.slice(bytes, messageWithNonce.length);

  return [nonce, message];
}
