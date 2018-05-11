import { english } from './bip39/wordlists';

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
export function mnemonicFromNaClBoxPrivateKey(privateKey: Uint8Array): string {
  const words = mapBytesToWords(privateKey);

  const checksumWord = '';

  return words.join(' ') + ' ' + checksumWord;
}

export function naclBoxPrivateKeyFromMnemonic(mnemonic: string): Uint8Array {
  return new Uint8Array();
}

// split number into 11-bit chunks
// NOTE: 2^11 = 2048
// NOTE: 2048 = how many words in a bip39 wordlist
// NOTE: list is range 0 - 2047
//
// BitArray: https://github.com/mikolalysenko/minimal-bit-array/blob/master/bitarray.js
//           ^ Seems not the fastest
function mapBytesToWords(bytes: Uint8Array): string[] {
  const uint11Array = toUint11Array(bytes);

  return uint11Array.map(n => english[n]);
}

// inspired from: https://github.com/pvorb/node-md5/issues/25
// https://stackoverflow.com/a/50285590/356849
export function toUint11Array(input: Uint8Array): number[] {
    var buffer = 0, numbits = 0;
    var output = [];

    for (var i = 0; i < input.length; i++) {
        // prepend bits to buffer
        buffer |= input[i] << numbits;
        numbits += 8;
        // if there are enough bits, extract 11bit chunk
        if (numbits >= 11) {
            // 0x7FF is 2047, the max 11 bit number
            output.push(buffer & 0x7FF);
            // drop chunk from buffer
            buffer = buffer >> 11;
            numbits -= 11;
        }
    }
    // also output leftover bits
    if (numbits != 0) {
      output.push(buffer & 0x7FF);
    }

    return output;
}

// from Uint11Array
export function toUint8Array(input: number[]) {

}
