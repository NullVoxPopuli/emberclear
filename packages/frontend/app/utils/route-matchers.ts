export const PRIVATE_CHAT_REGEX = /chat\/privately-with\/(.+)/;
export const CHANNEL_REGEX = /chat\/in-channel\/(.+)/;

export function idFrom(regex: RegExp, url: string) {
  let matches = regex.exec(url);
  let id = matches?.[1];

  return id || '';
}
