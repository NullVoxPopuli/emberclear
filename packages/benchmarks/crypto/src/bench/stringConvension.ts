import { Suite } from "asyncmark";
import libsodiumWrapper from "libsodium-wrappers";

import * as jsNaCl from "../lib/js-nacl";

import {
  libsodium,
  tweetnacl,
  jsnacl,
} from "../lib/utils";

const msg = Uint8Array.from([104, 101, 108, 101, 111]); // hello

export const stringConversion = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    await jsNaCl.setInstance();

    console.log("\nround trip uint8 <-> string encode + decode");
  }
});

stringConversion.add({
  name: "libsodium",
  fun: async () => {
    libsodium.fromString(await libsodium.toString(msg));
  }
});

stringConversion.add({
  name: "tweet-nacl",
  fun: async () => {
    tweetnacl.fromString(await tweetnacl.toString(msg));
  }
});

stringConversion.add({
  name: "js-nacl",
  fun: async () => {
    jsnacl.fromString(await jsnacl.toString(msg));
  }
});
