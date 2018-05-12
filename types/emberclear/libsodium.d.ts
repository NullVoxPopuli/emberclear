
interface BoxKeys {
  // keyType: string,
  privateKey: Uint8Array,
  publicKey: Uint8Array
}

type BoxInput =
  | string
  | Uint8Array

type Key =
  | string
  | Uint8Array

// namespace LibSodium {
//   crypto_box_keypair(): BoxKeys;
// }

// https://gist.github.com/buu700/039601a7b410474f0edba9977a8c6393
declare module 'libsodium-wrappers' {
  interface ISodium {
    ready: Promise<boolean>;
    libsodium: {
      usingWasm: boolean
    }

    randombytes_buf(bytes: number): Uint8Array;

  	crypto_aead_chacha20poly1305_ABYTES: number;
  	crypto_aead_chacha20poly1305_KEYBYTES: number;
  	crypto_aead_chacha20poly1305_NPUBBYTES: number;
  	crypto_box_NONCEBYTES: number;
  	crypto_box_PUBLICKEYBYTES: number;
  	crypto_box_SECRETKEYBYTES: number;
  	crypto_onetimeauth_BYTES: number;
  	crypto_onetimeauth_KEYBYTES: number;
  	crypto_pwhash_scryptsalsa208sha256_MEMLIMIT_INTERACTIVE: number;
  	crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_INTERACTIVE: number;
  	crypto_pwhash_scryptsalsa208sha256_OPSLIMIT_SENSITIVE: number;
  	crypto_pwhash_scryptsalsa208sha256_SALTBYTES: number;
  	crypto_scalarmult_BYTES: number;
  	crypto_scalarmult_SCALARBYTES: number;

  	crypto_aead_chacha20poly1305_decrypt (
  		secretNonce: Uint8Array|undefined,
  		cyphertext: Uint8Array,
  		additionalData: Uint8Array|undefined,
  		publicNonce: Uint8Array,
  		key: Uint8Array
  	) : Uint8Array;
  	crypto_aead_chacha20poly1305_encrypt (
  		plaintext: Uint8Array,
  		additionalData: Uint8Array|undefined,
  		secretNonce: Uint8Array|undefined,
  		publicNonce: Uint8Array,
  		key: Uint8Array
  	) : Uint8Array;
  	crypto_box_keypair () : {privateKey: Uint8Array; publicKey: Uint8Array};
  	crypto_box_seal (plaintext: Uint8Array, publicKey: Uint8Array) : Uint8Array;
  	crypto_box_seal_open (
  		cyphertext: Uint8Array,
  		publicKey: Uint8Array,
  		privateKey: Uint8Array
  	) : Uint8Array;
  	crypto_generichash (
  		outputBytes: number,
  		plaintext: Uint8Array,
  		key?: Uint8Array
  	) : Uint8Array;
  	crypto_onetimeauth (
  		message: Uint8Array,
  		key: Uint8Array
  	) : Uint8Array;
  	crypto_onetimeauth_verify (
  		mac: Uint8Array,
  		message: Uint8Array,
  		key: Uint8Array
  	) : boolean;
  	crypto_pwhash_scryptsalsa208sha256 (
  		keyBytes: number,
  		password: Uint8Array,
  		salt: Uint8Array,
  		opsLimit: number,
  		memLimit: number
  	) : Uint8Array;
  	crypto_scalarmult (privateKey: Uint8Array, publicKey: Uint8Array) : Uint8Array;
  	crypto_scalarmult_base (privateKey: Uint8Array) : Uint8Array;
  	crypto_stream_chacha20 (
  		outLength: number,
  		key: Uint8Array,
  		nonce: Uint8Array
  	) : Uint8Array;
  	from_base64 (s: string) : Uint8Array;
  	from_hex (s: string) : Uint8Array;
  	from_string (s: string) : Uint8Array;
  	memcmp (a: Uint8Array, b: Uint8Array) : boolean;
  	memzero (a: Uint8Array) : void;
  	to_base64 (a: Uint8Array) : string;
  	to_hex (a: Uint8Array) : string;
  	to_string (a: Uint8Array) : string;
  }

  const sodium: ISodium;
}
