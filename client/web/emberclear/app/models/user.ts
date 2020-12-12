import { attr } from '@ember-data/model';

import Identity from './identity';

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface SigningKeyPair {
  publicSigningKey: Uint8Array;
  privateSigningKey: Uint8Array;
}

export default class User extends Identity implements Partial<KeyPair>, Partial<SigningKeyPair> {
  @attr() privateKey!: Uint8Array;
  @attr() privateSigningKey!: Uint8Array;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: User;
  }
}
