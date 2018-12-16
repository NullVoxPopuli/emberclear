import libsodiumWrapper from 'libsodium-wrappers';

export async function wrapCatch(task) {
  try {
    await task();
  } catch(e) {
    console.error(e);
  }
}

export function fromString(str: string): Uint8Array {
  // return new TextEncoder().encode(str);
  return libsodiumWrapper.from_string(str);
}

export function concat(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
  const result = new Uint8Array(arr1.length + arr2.length);

  result.set(arr1, 0);
  result.set(arr2, arr1.length);

  return result;
}
