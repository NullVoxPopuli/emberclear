
import { decryptFrom } from 'emberclear/src/utils/nacl/utils';
import { fromHex, toString, fromBase64 } from 'emberclear/src/utils/string-encoding';

export async function decryptFromSocket(socketData: RelayMessage, privateKey: Uint8Array) {
    const { uid, message } = socketData;
    const senderPublicKey = fromHex(uid);
    const recipientPrivateKey = privateKey;

    const decrypted = await decryptMessage(message, senderPublicKey, recipientPrivateKey);

    return decrypted;
}

async function decryptMessage(message: string, senderPublicKey: Uint8Array, recipientPrivateKey: Uint8Array) {
  const messageBytes = await fromBase64(message);

  const decrypted = await decryptFrom(
    messageBytes, senderPublicKey, recipientPrivateKey
  );

  // TODO: consider a binary format, instead of
  //       converting to/from string and json
  const payload = toString(decrypted);
  const data = JSON.parse(payload);

  return data;
}
