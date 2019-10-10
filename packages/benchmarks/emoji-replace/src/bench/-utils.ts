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

  function directReplace(str: string) {
    return unicode(str);
  }

  function condition(str: string) {
    if (str.includes(":")) {
      return unicode(str);
    }

    return str;
  }

  const EMOJI_REGEX = /:[^:]+:/;

  function regexTest(str: string) {
    if (EMOJI_REGEX.test(str)) {
      return unicode(str);
    }

    return str;
  }

  function regexMatch(str: string) {
    if (str.match(EMOJI_REGEX)) {
      return unicode(str);
    }

    return str;
  }

  const bench = new Suite({
    async before() {
      assertEq(
        expected, directReplace(originalString),
        `${benchName}: direct replace failed`
      );
      assertEq(expected, condition(originalString), `${benchName}: condition failed`);
      assertEq(expected, regexTest(originalString), `${benchName}: condition failed`);

      console.log(`\n -- ${benchName} -- `);
    }
  });

  bench.add({
    name: "direct replace  ",
    fun: () => {
      directReplace(directReplace(originalString))
    }
  });

  bench.add({
    name: "condition for   ",
    fun: () => {
      condition(condition(originalString))
    }
  });

  bench.add({
    name: "regex test      ",
    fun: () => {
      regexTest(regexTest(originalString))
    }
  });

  bench.add({
    name: "regex match     ",
    fun: () => {
      regexMatch(regexMatch(originalString))
    }
  });

  return bench;
}

