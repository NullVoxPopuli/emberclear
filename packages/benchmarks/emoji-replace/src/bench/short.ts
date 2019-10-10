import { generateEmojisBench } from "./-utils";

const originalString = "I :heart: the :scream: emoji.";
const expected = "I ❤️ the 😱 emoji.";
const benchName = "short";

export const bench = generateEmojisBench({
  originalString,
  expected,
  benchName
});
