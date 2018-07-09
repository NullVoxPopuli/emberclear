export function matchAll(str: string, regex: RegExp) {
  let match;
  let result = [];

  while(match = regex.exec(str)) {
    result.push(match);
  }

  return result;
}
