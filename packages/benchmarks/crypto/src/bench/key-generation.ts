import { Suite } from 'asyncmark';

import { wrapCatch } from '../utils';

import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';

export const keyGeneration = new Suite({
  before() {
    console.log('\nKey Generation');
  }
});

keyGeneration.add({
  name: 'libsodium',
  fun: () => wrapCatch(libsodiumjs.generateAsymmetricKeys),

});

keyGeneration.add({
  name: 'tweetnacl',
  fun: () => wrapCatch(tweetNaCl.generateAsymmetricKeys),
});
