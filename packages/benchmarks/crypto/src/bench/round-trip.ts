import { Suite } from 'asyncmark';
import libsodiumWrapper from 'libsodium-wrappers';

import { wrapCatch } from '../utils';
import * as libsodiumjs from '../lib/libsodium';
import * as tweetNaCl from  '../lib/tweet-nacl';

const msg = Uint8Array.from([104, 101, 108, 101, 111]); // hello

export async function libsodium() {
  const receiver = await libsodiumjs.generateAsymmetricKeys();
  const sender = await libsodiumjs.generateAsymmetricKeys();

  const cipherText = await libsodiumjs.encryptFor(msg, receiver.publicKey, sender.privateKey);
  await libsodiumjs.decryptFrom(cipherText, sender.publicKey, receiver.privateKey);
}

export async function tweetnacl() {
  const receiver = tweetNaCl.generateAsymmetricKeys();
  const sender = tweetNaCl.generateAsymmetricKeys();

  const cipherText = await tweetNaCl.encryptFor(msg, receiver.publicKey, sender.secretKey);
  await tweetNaCl.decryptFrom(cipherText, sender.publicKey, receiver.secretKey);
}


export const roundTrip = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    console.log('\nRound-trip Box Encryption (short message)');
    console.log('libsodium using WASM:', libsodiumWrapper.libsodium.usingWasm);
  }
});

roundTrip.add({
  name: 'libsodium',
  fun: () => wrapCatch(libsodium),
});

roundTrip.add({
  name: 'tweetnacl',
  fun: () => wrapCatch(tweetnacl),
});

