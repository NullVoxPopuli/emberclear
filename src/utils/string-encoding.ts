import * as QRCode from 'qrcode';
import _libsodium from 'libsodium-wrappers';

export async function libsodium(): Promise<ISodium> {
  await _libsodium.ready;

  return _libsodium;
}

export async function toBase64(array: Uint8Array): Promise<string> {
  const sodium = await libsodium();

  return sodium.to_base64(array);
}

export async function fromBase64(base64: string): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.from_base64(base64);
}

export async function fromString(str: string): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.from_string(str);
}

export async function toString(uint8Array: Uint8Array): Promise<string> {
  const sodium = await libsodium();

  return sodium.to_string(uint8Array);
}

export async function ensureUint8Array(text: string | Uint8Array): Promise<Uint8Array> {
  if (text.constructor === Uint8Array) {
    return text as Uint8Array;
  }

  return await fromString(text as string);
}

// export function convertUint8ArrayToString(array: Uint8Array) {
//   const string = utf8Decoder.decode(array);
//   // string includes control characters, such as null
//   // which is common if the string is shorter than a block
//   const trimmed = string.replace(/^\0+/, '').replace(/\0+$/, '');
//
//   return trimmed;
// }

export async function convertObjectToQRCodeDataURL(object: any): Promise<string> {
  const string = JSON.stringify(object);

  return await QRCode.toDataURL(string);
}

export function convertObjectToBase64String(object: any): string {
  const json = JSON.stringify(object);
  const base64 = btoa(json);

  return base64;
}

export function convertBase64StringToObject(base64: string): any {
  const json = atob(base64);
  const object = JSON.parse(json);

  return object;
}

export function objectToDataURL(object: any): string {
  const string = convertObjectToBase64String(object);
  return `data:text/json;base64,${string}`;
}

// http://stackoverflow.com/a/39460727
export function base64ToHex(base64: string): string | undefined {
  if (base64 === undefined) return undefined;

  // convert to binary, than to hex
  const raw = atob(base64);
  let hex = '';

  for (let i = 0; i < raw.length; i++) {
    const hexChar = raw.charCodeAt(i).toString(16);
    hex += (hexChar.length === 2 ? hexChar : `0${hexChar}`);
  }

  return hex.toUpperCase();
}
