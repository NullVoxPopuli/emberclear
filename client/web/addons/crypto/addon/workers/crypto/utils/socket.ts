import { decryptFrom, encryptFor } from './nacl';
import { fromBase64, fromHex, toBase64, toString, toUint8Array } from './string-encoding';

import type {
  EncryptedMessage,
  KeyPrivate,
  KeyPublic,
  Serializable,
} from '@emberclear/crypto/types';

export async function encryptForSocket(payload: Serializable, to: KeyPublic, from: KeyPrivate) {
  const payloadString = JSON.stringify(payload);
  const payloadBytes = toUint8Array(payloadString);

  const encryptedMessage = await encryptFor(payloadBytes, to.publicKey, from.privateKey);

  return await toBase64(encryptedMessage);
}

export async function decryptFromSocket(socketData: EncryptedMessage, privateKey: Uint8Array) {
  const { uid, message } = socketData;
  const senderPublicKey = fromHex(uid);
  const recipientPrivateKey = privateKey;

  const decrypted = await decryptMessage(message, senderPublicKey, recipientPrivateKey);

  return decrypted;
}

async function decryptMessage(
  message: string,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
) {
  const messageBytes = await fromBase64(message);

  const decrypted = await decryptFrom(messageBytes, senderPublicKey, recipientPrivateKey);

  // TODO: consider a binary format, instead of
  //       converting to/from string and json
  const payload = toString(decrypted);
  const data = JSON.parse(payload);

  return data;
}
