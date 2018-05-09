// import * as bip from 'npm:bip39';
import bip from 'bip39';

import { fromString } from 'emberclear/src/utils/string-encoding';

// TODO: implement bip39 myself, since no existing library goes
//       privateKey -> mnemonic (only mnemonic -> privateKey)
//
// https://crypto.stackexchange.com/a/50759/8245
// BIP 39 describes the implementation of a mnemonic code or mnemonic sentence
// -- a group of easy to remember words --
// for the generation of deterministic wallets.
//
// Bitcoin private key is not stored in this way, rather seed to prng
// which generated the private and public key pair is converted into
// mnemonic so that its easy for human to type or remember.
//
// A list of 2048 words, which is indexed from 0-2047(11 bit information) is used.
// 132 bit value (128 bit seed + 4 bit checksum) is divided into 12 chunks of 11 bits each,
// then each 11 bit is used to select a word from dictionary.
//
// for more details see BIP39
export function mnemonicFromNaClBoxPrivateKey(privateKey: string) {
  // TODO: how to convert privateKey to mnemonic
  const mnemonic = bip.generateMnemonic();

  return mnemonic;
}
