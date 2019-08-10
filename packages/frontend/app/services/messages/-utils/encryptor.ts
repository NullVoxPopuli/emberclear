import { encryptFor } from 'emberclear/src/utils/nacl/utils';
import { toUint8Array, toBase64 } from 'emberclear/src/utils/string-encoding';
import { PublicKey } from 'emberclear/data/models/identity/model';
import { KeyPair } from 'emberclear/data/models/user/model';

export async function encryptForSocket(payload: RelayJson, to: PublicKey, from: KeyPair) {
  const payloadString = JSON.stringify(payload);
  const payloadBytes = toUint8Array(payloadString);

  const encryptedMessage = await encryptFor(payloadBytes, to.publicKey!, from.privateKey!);

  return await toBase64(encryptedMessage);
}
