import { Suite } from 'asyncmark';

import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';
import * as jsNaCl from '../lib/js-nacl';

export const keyGeneration = new Suite({
  async before() {
    console.log('\nKey Generation');
    await jsNaCl.setInstance();
  }
});

keyGeneration.add({
  name: 'libsodium',
  fun: libsodiumjs.generateAsymmetricKeys,

});

keyGeneration.add({
  name: 'tweetnacl',
  fun: tweetNaCl.generateAsymmetricKeys,
});

keyGeneration.add({
  name: 'js-nacl',
  fun: jsNaCl.generateAsymmetricKeys,
})
