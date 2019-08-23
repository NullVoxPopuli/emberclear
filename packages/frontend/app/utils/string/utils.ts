export function matchAll(str: string, regex: RegExp) {
  let match;
  let result = [];

  while ((match = regex.exec(str))) {
    result.push(match);
  }

  return result;
}

export function parseLanguages(text: string): string[] {
  let languages: string[] = [];

  const matches = matchAll(text, /```(\w+)/g);

  matches.forEach(match => languages.push(match[1]));

  return languages;
}

// https://www.regextester.com/98192
const URL_PATTERN = /(((http|https)\:\/\/)|(www)){1}[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/gi;

export function parseURLs(text: string): string[] {
  const urls = text.match(URL_PATTERN);
  if (urls === null) return [];

  return urls.map(u => u.replace('gifv', 'mp4'));
}

const HOST_FROM_URL_REGEX = /\/\/(.+)\//;
export function hostFromURL(url: string) {
  const matches = url.match(HOST_FROM_URL_REGEX);

  return matches && matches[1];
}
