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
export function mnemonicFromNaClBoxPrivateKey(privateKey: string) {
  const bytes = fromString(privateKey);
  const words = mapBytesToWords(bytes);

  const checksumWord = '';

  return words.join(' ') + ' ' + checksumWord;
}

// split number into 11-bit chunks
// NOTE: 2^11 = 2048
// NOTE: 2048 = how many words in a bip39 wordlist
//
// BitArray: https://github.com/mikolalysenko/minimal-bit-array/blob/master/bitarray.js
//           ^ Seems not the fastest
function mapBytesToWords(bytes: Uint8Array): string[] {
  const uint11Array = toUint11Array(bytes);

  return uint11Array.map(n => english[bitArrayToNumber(n)]);
}

// inspired from: https://github.com/pvorb/node-md5/issues/25
function toUint11Array(input: Uint8Array): boolean[][] {
  let result: boolean[][] = [];
  let currentChunk: boolean[] = [];
  input.forEach(byte => {
    for (var j = 7; j >= 0; j--) {
      var b = ((byte >> j) & 0x1) > 0;
      currentChunk.push(b);

      if (currentChunk.length === 11) {
        result.push(currentChunk);
        currentChunk = [];
      }
    }
  });

  return result;
}

function bitArrayToNumber(input: boolean[]): number {
  return input.reduce((result, x) => result << 1 | x, 0);
}
