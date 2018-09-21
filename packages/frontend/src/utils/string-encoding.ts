import QRCode from 'qrcode';
import libsodiumWrapper from 'libsodium-wrappers';

import { libsodium } from 'emberclear/src/utils/nacl/utils';

// for the utils, we don't care about wasm,
// so the conversions don't need to be async
const sodium = (libsodiumWrapper as any).sodium as typeof libsodiumWrapper;

export function toHex(array: Uint8Array): string {
  return sodium.to_hex(array);
}

export function fromHex(hex: string): Uint8Array {
  return sodium.from_hex(hex);
}

export async function toBase64(array: Uint8Array): Promise<string> {
  const sodium = await libsodium();

  return sodium.to_base64(array, sodium.base64_variants.ORIGINAL);
}

export async function fromBase64(base64: string): Promise<Uint8Array> {
  const sodium = await libsodium();

  return sodium.from_base64(base64, sodium.base64_variants.ORIGINAL);
}

export function fromString(str: string): Uint8Array {
  // return new TextEncoder().encode(str);
  return sodium.from_string(str);
}

export const toUint8Array = fromString;

export function toString(uint8Array: Uint8Array): string {
  // return new TextDecoder("utf-8").decode(uint8Array);
return sodium.to_string(uint8Array);
}

export function ensureUint8Array(text: string | Uint8Array): Uint8Array {
  if (text.constructor === Uint8Array) {
    return text as Uint8Array;
  }

  return fromString(text as string);
}

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
