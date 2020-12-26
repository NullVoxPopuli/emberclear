declare module 'blakejs' {
  export function blake2b(
    input: string | Uint8Array,
    key?: Uint8Array | undefined,
    outlen?: number
  ): Uint8Array;
}
