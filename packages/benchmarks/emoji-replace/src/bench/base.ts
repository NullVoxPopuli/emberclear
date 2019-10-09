import { Suite } from "asyncmark";
import { assertEq } from './-utils';

let hit = 'something :heart:';
let miss = 'something .heart.';

const EMOJI_REGEX = /:[^:]+:/g;

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
