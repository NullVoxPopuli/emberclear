import { generateEmojisBench } from "./-utils";

const originalString = ".. scream";
const expected = ".. scream";
const benchName = "micro (no emojis)";

export const bench = generateEmojisBench({
  originalString,
  expected,
  benchName
});
