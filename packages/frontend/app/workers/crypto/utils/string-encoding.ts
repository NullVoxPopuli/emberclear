import utils from 'tweetnacl-util';

export function toHex(array: Uint8Array): string {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  if (Math.ceil(hex.length / 2) !== hex.length / 2) {
    throw new Error('hex string is the wrong length');
  }

  const matches = hex.match(/.{1,2}/g) || [];

  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}

export async function toBase64(array: Uint8Array): Promise<string> {
  return utils.encodeBase64(array);
}

export async function fromBase64(base64: string): Promise<Uint8Array> {
  return utils.decodeBase64(base64);
}

export function fromString(str: string): Uint8Array {
  return utils.decodeUTF8(str);
}

export const toUint8Array = fromString;

export function toString(uint8Array: Uint8Array): string {
  return utils.encodeUTF8(uint8Array);
}

export function ensureUint8Array(text: string | Uint8Array): Uint8Array {
  if (text.constructor === Uint8Array) {
    return text as Uint8Array;
  }

  return fromString(text as string);
}

// http://stackoverflow.com/a/39460727
export function base64ToHex(base64: string): string | undefined {
  if (base64 === undefined) return undefined;

  // convert to binary, than to hex
  const raw = atob(base64);
  let hex = '';

  for (let i = 0; i < raw.length; i++) {
    const hexChar = raw.charCodeAt(i).toString(16);
    hex += hexChar.length === 2 ? hexChar : `0${hexChar}`;
  }

  return hex.toUpperCase();
}
