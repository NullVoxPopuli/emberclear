import { Suite } from 'asyncmark';

import { wrapCatch } from '../utils';

import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';

export const nonceGeneration = new Suite({
  before() {
    console.log('\nNonce Generation');
  }
});

nonceGeneration.add({
  name: 'libsodium',
  fun: () => wrapCatch(libsodiumjs.generateNonce),

});

nonceGeneration.add({
  name: 'tweetnacl',
  fun: () => wrapCatch(tweetNaCl.generateNonce),
});
