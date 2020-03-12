import QRCode from 'qrcode';

export function toHex(array: Uint8Array): string {
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  if (Math.ceil(hex.length / 2) !== hex.length / 2) {
    throw new Error('hex string is the wrong length');
  }

  const matches = hex.match(/.{1,2}/g) || [];

  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
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
  const string = JSON.stringify(object);
  return `data:text/json;charset=utf-8,${encodeURIComponent(string)}`;
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
