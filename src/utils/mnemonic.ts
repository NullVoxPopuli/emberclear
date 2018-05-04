// import * as bip from 'bip39';
import { convertBase64StringToUint8Array } from 'emberclear/src/utils/string-encoding';

export function mnemonicFromNaClBoxPrivateKey(privateKey: string) {
  // const bytes = convertBase64StringToUint8Array(privateKey);

  // console.log(bytes);
  return privateKey;
}
