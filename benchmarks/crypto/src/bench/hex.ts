import { Suite } from "asyncmark";
import libsodiumWrapper from "libsodium-wrappers";

import * as jsNaCl from "../lib/js-nacl";

import {
  libsodium,
  tweetnacl,
  jsnacl,
} from "../lib/utils";
import { Buffer } from "buffer";

const msg = Uint8Array.from([104, 101, 108, 101, 111]); // hello

export const hex = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    await jsNaCl.setInstance();

    console.log("\nround trip uint8 <-> string encode + decode");
  }
});

hex.add({
  name: "libsodium",
  fun: async () => {
    libsodium.fromHex(await libsodium.toHex(msg));
  }
});

// hex.add({
//   name: "tweet-nacl",
//   fun: async () => {
//     tweetnacl.fromString(await tweetnacl.toString(msg));
//   }
// });

hex.add({
  name: "js-nacl",
  fun: async () => {
    jsnacl.fromHex(await jsnacl.toHex(msg));
  }
});

hex.add({
  name: "native ",
  fun: async() => {
    const hex = Array.from(msg).map (b => b.toString(16).padStart(2, "0")).join("");
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  }
});