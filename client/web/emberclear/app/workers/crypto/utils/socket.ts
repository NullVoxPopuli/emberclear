import { toUint8Array, toBase64, fromHex, fromBase64, toString } from './string-encoding';
import { encryptFor, decryptFrom } from './nacl';

export async function encryptForSocket(payload: RelayJson, to: KeyPublic, from: KeyPrivate) {
  const payloadString = JSON.stringify(payload);
  const payloadBytes = toUint8Array(payloadString);

  const encryptedMessage = await encryptFor(payloadBytes, to.publicKey!, from.privateKey!);

  return await toBase64(encryptedMessage);
}

export async function decryptFromSocket(socketData: RelayMessage, privateKey: Uint8Array) {
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
