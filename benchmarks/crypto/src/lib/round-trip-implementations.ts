import * as libsodiumjs from "../lib/libsodium";
import * as tweetNaCl from "../lib/tweet-nacl";
import * as jsNaCl from "../lib/js-nacl";

export async function libsodium(msg: Uint8Array) {
  const receiver = await libsodiumjs.generateAsymmetricKeys();
  const sender = await libsodiumjs.generateAsymmetricKeys();

  const cipherText = await libsodiumjs.encryptFor(
    msg,
    receiver.publicKey,
    sender.privateKey
  );
  const decrypted = await libsodiumjs.decryptFrom(
    cipherText,
    sender.publicKey,
    receiver.privateKey
  );

  ensureEquality("libsodium", msg, decrypted, libsodiumjs.toString);
}

export async function tweetnacl(msg: Uint8Array) {
  const receiver = tweetNaCl.generateAsymmetricKeys();
  const sender = tweetNaCl.generateAsymmetricKeys();

  const cipherText = await tweetNaCl.encryptFor(
    msg,
    receiver.publicKey,
    sender.secretKey
  );
  const decrypted = await tweetNaCl.decryptFrom(
    cipherText,
    sender.publicKey,
    receiver.secretKey
  );

  ensureEquality("tweetnacl", msg, decrypted, tweetNaCl.toString);
}

export async function jsnacl(msg: Uint8Array) {
  const receiver = jsNaCl.generateAsymmetricKeys();
  const sender = jsNaCl.generateAsymmetricKeys();

  const cipherText = jsNaCl.encryptFor(msg, receiver.boxPk, sender.boxSk);
  const decrypted = await jsNaCl.decryptFrom(
    cipherText,
    sender.boxPk,
    receiver.boxSk
  );

  ensureEquality("jsnacl", msg, decrypted, jsNaCl.nacl.decode_utf8);
}

function ensureEquality(
  label: string,
  a: Uint8Array,
  b: Uint8Array,
  toString: any
) {
  const as = toString(a);
  const bs = toString(b);
  if (as !== bs) {
    throw new Error(`
      message was not encrypted and/or decrypted properly.

      Expected ${as}
      to equal ${bs}

    `);
  }
}
