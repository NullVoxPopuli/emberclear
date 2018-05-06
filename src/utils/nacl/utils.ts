// import NaCl from 'tweetnacl';
import secureRandom from 'secure-random';

import _libsodium from 'libsodium-wrappers';

export async function libsodium(): ISodium {
  await _libsodium.ready;

  return _libsodium;
}

import {
  convertUint8ArrayToBase64String,
  convertBase64StringToUint8Array,
  convertStringToUint8Array,
  convertUint8ArrayToString,
  ensureUint8Array
} from 'emberclear/src/utils/string-encoding';

export async function generateNewKeys(): BoxKeys {
  const sodium = await libsodium();

  return sodium.crypto_box_keypair();
}

export async function encryptFor(messageWithoutNonce: string, theirPublicKey: Key, mySecretKey: Key) {
  const sodium = await libsodium();
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const keyPair = {
    privateKey: ensureUint8Array(mySecretKey),
    publicKey: ensureUint8Array(theirPublicKey)
  };
  const msg = ensureUint8Array(messageWithoutNonce);
  const publicKey = ensureUint8Array(theirPublicKey);

  const box = sodium.crypto_box_seal(msg, keyPair.publicKey);

  const fullMessage = new Uint8Array(nonce.length + box.length);

  fullMessage.set(nonce);
  fullMessage.set(msg, nonce.length);

  return fullMessage;
}


export async function decryptFrom(messageWithNonce: string, theirPublicKey: Key, mySecretKey: Key) {
  const sodium = await libsodium();
  const nonceBytes = sodium.crypto_box_NONCEBYTES;

  const keyPair = {
    privateKey: ensureUint8Array(mySecretKey),
    publicKey: ensureUint8Array(theirPublicKey)
  };
  const msg = ensureUint8Array(messageWithNonce);
  const nonce = msg.slice(0, nonceBytes);
  const message = msg.slice(nonceBytes, msg.length);

  // const box = sodium.crypto_box_seal()
  const decrypted = sodium.crypto_box_seal_open(message, keyPair);

  if (decrypted == null) {
    console.error('error decrypted')
    return;
  }

  const base64DecryptedMessage = convertUint8ArrayToString(decrypted);

  return base64DecryptedMessage;
}




// export function encryptFor(messageWithoutNonce: string, theirPublicKey: string, mySecretKey: string) {
//   const theirPublicKeyUint8Array = convertBase64StringToUint8Array(theirPublicKey);
//   const mySecretKeyUint8Array = convertBase64StringToUint8Array(mySecretKey);
//
//   const nonce = newNonce();
//   const message = convertStringToUint8Array(messageWithoutNonce);
//   const box = NaCl.box(
//     message,
//     nonce,
//     theirPublicKeyUint8Array,
//     mySecretKeyUint8Array);
//
//   const fullMessage = new Uint8Array(nonce.length + box.length);
//
//   fullMessage.set(nonce);
//   fullMessage.set(message, nonce.length);
//
//   const base64FullMessage = convertUint8ArrayToBase64String(fullMessage);
//   return base64FullMessage;
// }
//
// export function decryptFrom(messageWithNonce: string, theirPublicKey: string, mySecretKey: string) {
//   const theirPublicKeyUint8Array = convertBase64StringToUint8Array(theirPublicKey);
//   const mySecretKeyUint8Array = convertBase64StringToUint8Array(mySecretKey);
//   const messageWithNonceAsUint8Array = convertBase64StringToUint8Array(messageWithNonce);
//   const nonce = messageWithNonceAsUint8Array.slice(0, 24);
//   const message = messageWithNonceAsUint8Array.slice(24, messageWithNonce.length);
//
//   const box = NaCl.box(message, nonce, theirPublicKeyUint8Array, mySecretKeyUint8Array);
//   const decrypted = NaCl.box.open(box, nonce, theirPublicKeyUint8Array, mySecretKeyUint8Array);
//
//   if (decrypted == null) {
//     console.error('error decrypted')
//     return;
//   }
//
//   const base64DecryptedMessage = convertUint8ArrayToString(decrypted);
//
//   return base64DecryptedMessage;
// }

export function newNonce(): Uint8Array {
  // optionally takes a second parameter
  // { type: 'Type' }
  // where 'Type' could be any of
  // - 'Array'
  // - 'Buffer'
  // - 'Uint8Array'
  return secureRandom(24, { type: 'Uint8Array' });
}
