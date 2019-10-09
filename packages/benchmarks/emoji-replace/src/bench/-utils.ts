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

  // the string must not be the same for each benchmark
  // or the runtime will optimize!
  //
  let i = 0;
  function directReplace() {
    let str = `${i++} ${originalString}`

    return unicode(str);
  }

  function condition() {
    let str = `${i++} ${originalString}`

    if (str.includes(":")) {
      return unicode(str);
    }

    return str;
  }

  const EMOJI_REGEX = /:[^:]+:/;

  function regexTest() {
    let str = `${i++} ${originalString}`

    if (EMOJI_REGEX.test(str)) {
      return unicode(str);
    }

    return str;
  }

  function regexMatch() {
    let str = `${i++} ${originalString}`

    if (str.match(EMOJI_REGEX)) {
      return unicode(str);
    }

    return str;
  }

  const bench = new Suite({
    async before() {
      assertEq(
        `0 ${expected}`, directReplace(),
        `${benchName}: direct replace failed`
      );
      assertEq(`1 ${expected}`, condition(), `${benchName}: condition failed`);
      assertEq(`2 ${expected}`, regexTest(), `${benchName}: condition failed`);

      console.log(`\n -- ${benchName} -- `);
    }
  });

  bench.add({
    name: "return unchanged",
    fun: () => originalString,
  })

  bench.add({
    name: "direct replace  ",
    fun: () => directReplace()
  });

  bench.add({
    name: "condition for   ",
    fun: () => condition()
  });

  bench.add({
    name: "regex test      ",
    fun: () => regexTest()
  });

  bench.add({
    name: "regex match     ",
    fun: () => regexMatch()
  });

  return bench;
}

