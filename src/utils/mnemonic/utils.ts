// import * as bip from 'npm:bip39';
import bip from 'bip39';

import { fromString } from 'emberclear/src/utils/string-encoding';

export function mnemonicFromNaClBoxPrivateKey(privateKey: string) {
  // TODO: how to convert privateKey to mnemonic
  const mnemonic = bip.generateMnemonic();

  return mnemonic;
}
