import { Suite } from "asyncmark";
import { unicode } from "emojis";

export function assertEq<T>(expected: T, actual: T, msg: string) {
  if (expected !== actual) {
    throw new Error(`
      ${ msg }

      expected:

        ${actual}

        to equal

        ${expected}
    `);
  }
}

interface Args {
  originalString: string;
  expected: string;
  benchName: string;
}

export function generateEmojisBench({
  originalString,
  expected,
  benchName
}: Args) {
  function directReplace() {
    return unicode(originalString);
  }

  function condition() {
    if (originalString.includes(":")) {
      return unicode(originalString);
    }

    return originalString;
  }

  const EMOJI_REGEX = /:([^:]+:)/g;

  function regex() {
    if (EMOJI_REGEX.test(originalString)) {
      return unicode(originalString);
    }

    return originalString;
  }

  const bench = new Suite({
    async before() {
      assertEq(
        expected, directReplace(),
        `${benchName}: direct replace failed`
      );
      assertEq(expected, condition(), `${benchName}: condition failed`);
      assertEq(expected, regex(), `${benchName}: condition failed`);

      console.log(`\n -- ${benchName} -- `);
    }
  });

  bench.add({
    name: "direct replace",
    fun: () => directReplace()
  });

  bench.add({
    name: "condition for ",
    fun: () => condition()
  });

  bench.add({
    name: "regex match   ",
    fun: () => regex()
  });

  return bench;
}
