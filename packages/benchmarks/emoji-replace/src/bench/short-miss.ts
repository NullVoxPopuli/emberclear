import { generateEmojisBench } from "./-utils";

const originalString = "I heart the scream emoji.";
const benchName = "short (no emojis)";

export const bench = generateEmojisBench({
  originalString,
  expected: originalString,
  benchName
});
