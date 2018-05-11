import { english } from './bip39/wordlists';

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
//
// NOTE: 2^11 = 2048
// NOTE: 2048 = how many words in a bip39 wordlist
// NOTE: list is range 0 - 2047
export async function mnemonicFromNaClBoxPrivateKey(privateKey: Uint8Array): Promise<string> {
  const uint11Array = toUint11Array(privateKey);
  const words = applyWords(uint11Array);

  const checksumWord = await computeChecksum(uint11Array);

  return words.join(' ') + ' ' + checksumWord;
}

export function naclBoxPrivateKeyFromMnemonic(mnemonic: string): Uint8Array {
  return new Uint8Array();
}

export async function computeChecksum(nums: number[]): Promise<string> {
  const sum = nums.reduce((acc, v) => acc + v);

  const hashBuffer = await crypto.subtle.digest('SHA-256', Uint32Array.from([sum]));

  const arr = new Uint8Array(hashBuffer);
  const uint11Hash = toUint11Array(arr);
  const words = applyWords(uint11Hash);

  return words[0];
}

function applyWords(nums: number[]): string[] {
  return nums.map(n => english[n]);
}

// https://stackoverflow.com/a/50285590/356849
export function toUint11Array(input: Uint8Array): number[] {
  let buffer = 0;
  let numbits = 0;
  let output = [];

  for (let i = 0; i < input.length; i++) {
    // prepend bits to buffer
    buffer |= input[i] << numbits;
    numbits += 8;
    // if there are enough bits, extract 11bit chunk
    if (numbits >= 11) {
      // 0x7FF is 2047, the max 11 bit number
      const elevenBitNum = buffer & 0x7ff
      output.push(elevenBitNum);
      // drop chunk from buffer
      buffer = buffer >> 11;
      numbits -= 11;
    }
  }
  // also output leftover bits
  if (numbits != 0) {
    const elevenBitNum = buffer & 0x7ff
    output.push(elevenBitNum);
  }

  return output;
}

// from Uint11Array
export function toUint8Array(input: number[]): Uint8Array {
  let buffer = 0;
  let numbits = 0;
  let output: number[] = [];


  return Uint8Array.from(output);
}
