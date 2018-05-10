import { english } from './bip39/wordlists';

import { fromString, toNumber } from 'emberclear/src/utils/string-encoding';

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
function mapBytesToWords(bytes: Uint8Array): string[] {
  const num = toNumber(bytes);
  const chunks = numberToBitChunks(num);

  return chunks.map(n => english[n]);
}

function numberToBitChunks(num: number): number[] {
  let result: number[] = [];
  let remaining = num;

  while (remaining !== 0) {
    const elevenBitValue = shift(remaining, -11);

    result.push(elevenBitValue);

    remaining
  }


  return result;
}

// NOTE: javascript can't handle > 32bit bit-wise operations
//       so we trick the javascript.
// https://en.wikipedia.org/wiki/Arithmetic_shift
function shift(number: number, shift: number): number {
    return number * Math.pow(2, shift);
}
