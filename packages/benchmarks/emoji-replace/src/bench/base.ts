import { Suite } from "asyncmark";
import { assertEq } from './-utils';

let hit = `
something :heart:
Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

smile

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.
something :heart:
something :heart:
`;
let miss = `
something .heart.
Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

smile

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.
something .heart.
something .heart.
`;

const EMOJI_REGEX = /:[^:]+:/;

export const bench = new Suite({
  async before() {
    assertEq(true, hit.includes(':'), 'hit include :');
    assertEq(true, EMOJI_REGEX.test(hit), 'regex matches hit');

    console.log(`\n -- baseline (no emoji substitution) -- `);
  }
});

bench.add({
  name: "direct replace (ret)",
  fun: () => {
    return hit;
  }
});

bench.add({
  name: "condition for  (hit)",
  fun: () => {
    if (hit.includes(':')) {
      return hit;
    }

    return hit; // never
  }
});

bench.add({
  name: "condition for (miss)",
  fun: () => {
    if (miss.includes(':')) {
      return miss;
    }

    return miss; // always
  }
});

bench.add({
  name: "regex match    (hit)",
  fun: () => {
    if (EMOJI_REGEX.test(hit)) {
      return hit;
    }

    return hit; //
  }
});

bench.add({
  name: "regex match   (miss)",
  fun: () => {
    if (EMOJI_REGEX.test(miss)) {
      return miss;
    }

    return miss; // always
  }
});

bench.add({
  name: "regex match in (hit)",
  fun: () => {
    if (/:[^:]+:/.test(hit)) {
      return hit;
    }

    return hit; //
  }
});

bench.add({
  name: "regex match i (miss)",
  fun: () => {
    if (/:[^:]+:/.test(miss)) {
      return miss;
    }

    return miss; // always
  }
});
