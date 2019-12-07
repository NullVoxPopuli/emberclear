import { naclBoxPrivateKeyFromMnemonic } from './utils/mnemonic';
import { derivePublicKey } from './utils/nacl';

export async function login(mnemonic: string): Promise<KeyPublic> {
  let privateKey = await naclBoxPrivateKeyFromMnemonic(mnemonic);
  let publicKey = await derivePublicKey(privateKey);

  return { publicKey };
}
