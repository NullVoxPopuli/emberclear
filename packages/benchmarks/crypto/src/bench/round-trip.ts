import { Suite } from "asyncmark";
import libsodiumWrapper from "libsodium-wrappers";

import * as jsNaCl from "../lib/js-nacl";
import {
  libsodium,
  tweetnacl,
  jsnacl
} from "../lib/round-trip-implementations";

const msg = Uint8Array.from([104, 101, 108, 101, 111]); // hello

export const roundTrip = new Suite({
  async before() {
    await libsodiumWrapper.ready;
    await jsNaCl.setInstance();

    console.log("\nRound-trip Box Encryption (short message)");
  }
});

roundTrip.add({
  name: "libsodium",
  fun: () => libsodium(msg)
});

roundTrip.add({
  name: "tweetnacl",
  fun: () => tweetnacl(msg)
});

roundTrip.add({
  name: "js-nacl",
  fun: () => jsnacl(msg)
});
