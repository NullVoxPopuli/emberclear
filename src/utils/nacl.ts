import NaCl from 'tweetnacl';
import secureRandom from 'secure-random';

import {
  convertUint8ArrayToBase64String,
  convertBase64StringToUint8Array,
  convertStringToUint8Array,
  convertUint8ArrayToString
} from 'emberclear/src/utils/string-encoding';

export function generateNewKeys() {
  const newKeys = NaCl.box.keyPair();

  // always store ase base64 string
  const publicKey = convertUint8ArrayToBase64String(newKeys.publicKey);
  const privateKey = convertUint8ArrayToBase64String(newKeys.secretKey);

  return { publicKey, privateKey };
}

export function encryptFor(messageWithoutNonce: string, theirPublicKey: string, mySecretKey: string) {
  const theirPublicKeyUint8Array = convertBase64StringToUint8Array(theirPublicKey);
  const mySecretKeyUint8Array = convertBase64StringToUint8Array(mySecretKey);

  const nonce = newNonce();
  const message = convertStringToUint8Array(messageWithoutNonce);
  const box = NaCl.box(
    message,
    nonce,
    theirPublicKeyUint8Array,
    mySecretKeyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(message, nonce.length);

  const base64FullMessage = convertUint8ArrayToBase64String(fullMessage);
  return base64FullMessage;
}

export function decryptFrom(messageWithNonce: string, theirPublicKey: string, mySecretKey: string) {
  const theirPublicKeyUint8Array = convertBase64StringToUint8Array(theirPublicKey);
  const mySecretKeyUint8Array = convertBase64StringToUint8Array(mySecretKey);
  const messageWithNonceAsUint8Array = convertBase64StringToUint8Array(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, 24);
  const message = messageWithNonceAsUint8Array.slice(24, messageWithNonce.length);

  const box = NaCl.box(message, nonce, theirPublicKeyUint8Array, mySecretKeyUint8Array);
  const decrypted = NaCl.box.open(box, nonce, theirPublicKeyUint8Array, mySecretKeyUint8Array);

  if (decrypted == null) {
    console.error('error decrypted')
    return;
  }

  const base64DecryptedMessage = convertUint8ArrayToString(decrypted);

  return base64DecryptedMessage;
}

export function newNonce(): Uint8Array {
  // optionally takes a second parameter
  // { type: 'Type' }
  // where 'Type' could be any of
  // - 'Array'
  // - 'Buffer'
  // - 'Uint8Array'
  return secureRandom(24, { type: 'Uint8Array' });
}
