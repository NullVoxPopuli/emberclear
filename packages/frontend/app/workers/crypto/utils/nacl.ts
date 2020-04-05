import nacl from 'tweetnacl';
import { concat } from './array';
import { blake2b } from 'blakejs';

export async function genericHash(arr: Uint8Array): Promise<Uint8Array> {
  return blake2b(arr, undefined, 32);
}

export async function derivePublicKey(privateKey: Uint8Array) {
  const keypair = nacl.box.keyPair.fromSecretKey(privateKey);

  return keypair.publicKey;
}

export async function derivePublicSigningKey(privateSigningKey: Uint8Array) {
  const keyPair = nacl.sign.keyPair.fromSecretKey(privateSigningKey);

  return keyPair.publicKey;
}

export async function randomBytes(length: number) {
  return nacl.randomBytes(length);
}

export async function generateNonce() {
  return nacl.randomBytes(nacl.box.nonceLength);
}

export async function generateAsymmetricKeys() {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.secretKey,
  };
}

export async function generateSymmetricKeys() {
  return nacl.randomBytes(nacl.secretbox.keyLength);
}

export async function generateSigningKeys() {
  const keyPair =  nacl.sign.keyPair();

  return {
    publicSigningKey: keyPair.publicKey,
    privateSigningKey: keyPair.secretKey,
  };
}

export async function encryptFor(
  message: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderPrivateKey: Uint8Array
): Promise<Uint8Array> {
  const nonce = await generateNonce();

  const ciphertext = nacl.box(message, nonce, recipientPublicKey, senderPrivateKey);

  return concat(nonce, ciphertext);
}

export async function decryptFrom(
  ciphertextWithNonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
): Promise<Uint8Array> {
  const [nonce, ciphertext] = splitNonceFromMessage(ciphertextWithNonce);
  const decrypted = nacl.box.open(ciphertext, nonce, senderPublicKey, recipientPrivateKey);

  return decrypted as Uint8Array;
}

export function splitNonceFromMessage(messageWithNonce: Uint8Array): [Uint8Array, Uint8Array] {
  const bytes = nacl.box.nonceLength;

  const nonce = messageWithNonce.slice(0, bytes);
  const message = messageWithNonce.slice(bytes, messageWithNonce.length);

  return [nonce, message];
}
