import { Suite } from "asyncmark";
import libsodiumWrapper from "libsodium-wrappers";

import * as jsNaCl from "../lib/js-nacl";
import {
  libsodium,
  tweetnacl,
} from "../lib/utils";

const msg = Uint8Array.from([104, 101, 108, 101, 111]); // hello

export const base64 = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    await jsNaCl.setInstance();

    console.log("\nround trip base64 encode + decode");
  }
});

base64.add({
  name: "libsodium",
  fun: async () => {
    libsodium.fromBase64(await libsodium.toBase64(msg));
  }
});

base64.add({
  name: "tweetnacl",
  fun: async () => {
    tweetnacl.fromBase64(await tweetnacl.toBase64(msg));
  }
});
