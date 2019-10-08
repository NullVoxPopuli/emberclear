import { generateEmojisBench } from "./-utils";

const originalString = ":scream:";
const expected = "😱";
const benchName = "micro";

export const bench = generateEmojisBench({
  originalString,
  expected,
  benchName
});
