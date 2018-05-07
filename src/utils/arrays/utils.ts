type ArrayBuffers =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Float32Array
  | Float64Array

export function concat<T extends ArrayBuffers>(arr1: T, arr2: T): T {
  const result = new Uint8Array(arr1.length + arr2.length);

  result.set(arr1, 0);
  result.set(arr2, arr1.length);

  return result;
}
