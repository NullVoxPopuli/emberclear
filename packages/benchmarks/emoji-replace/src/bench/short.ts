import { Suite } from "asyncmark";
import { unicode } from 'emojis';

const originalString = "I :heart: the :scream: emoji."
export const bench = new Suite();

bench.add({
  name: "direct replace",
  fun: async () => {
    let result = unicode(originalString);

    return result;
  }
});

bench.add({
  name: "condition for ",
  fun: async () => {
    if (originalString.includes(':')) {
      return unicode(originalString);
    }

    return originalString;
  }
});

const EMOJI_REGEX = /:([^:]+:)/g;

bench.add({
  name: "regex match   ",
  fun: async () => {
    if (EMOJI_REGEX.test(originalString)) {
      return unicode(originalString);
    }

    return originalString;
  }
})
