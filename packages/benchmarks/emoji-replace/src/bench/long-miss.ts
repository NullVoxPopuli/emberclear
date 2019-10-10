import { generateEmojisBench } from "./-utils";

const benchName = "long (no emojis)";
const originalString = `
  I heart the scream emoji.

Lorem ipsum dolor sit amet, consectetur adipiscing elit,
sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

smile

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
Excepteur sint occaecat cupidatat non proident,
sunt in culpa qui officia deserunt mollit anim id est laborum.

I heart the scream emoji.
`;

export const bench = generateEmojisBench({
  originalString,
  expected: originalString,
  benchName
});
