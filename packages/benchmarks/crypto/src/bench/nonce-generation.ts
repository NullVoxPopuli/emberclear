import { Suite } from 'asyncmark';

import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';
import * as jsNaCl from '../lib/js-nacl';

export const nonceGeneration = new Suite({
  async before() {
    console.log('\nNonce Generation');
    await jsNaCl.setInstance();
  }
});

nonceGeneration.add({
  name: 'libsodium',
  fun: libsodiumjs.generateNonce,

});

nonceGeneration.add({
  name: 'tweetnacl',
  fun: tweetNaCl.generateNonce,
});

nonceGeneration.add({
  name: 'js-nacl',
  fun: jsNaCl.generateNonce,
});
