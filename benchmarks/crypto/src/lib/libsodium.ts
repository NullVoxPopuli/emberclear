import libsodiumWrapper, { KeyPair } from 'libsodium-wrappers';

import { concat } from '../utils';

export async function libsodium(): Promise<typeof libsodiumWrapper> {
  const sodium = (libsodiumWrapper as any);
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

export function toHex(array: Uint8Array): string {
  return libsodiumWrapper.to_hex(array);
}

export function fromHex(hex: string): Uint8Array {
  return libsodiumWrapper.from_hex(hex);
}

export async function toBase64(array: Uint8Array): Promise<string> {
  const sodium = await libsodium();

  return sodium.to_base64(array, sodium.base64_variants.ORIGINAL);
}

export async function fromBase64(base64: string): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.from_base64(base64, sodium.base64_variants.ORIGINAL);
}

export function fromString(str: string): Uint8Array {
  return libsodiumWrapper.from_string(str);
}

export const toUint8Array = fromString;

export function toString(uint8Array: Uint8Array): string {
  return libsodiumWrapper.to_string(uint8Array);
}

