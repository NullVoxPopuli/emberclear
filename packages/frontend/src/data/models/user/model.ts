import DS from 'ember-data';
import Identity from '../identity/model';
const { attr } = DS;

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export default class User extends Identity implements Partial<KeyPair> {
  @attr() privateKey!: Uint8Array;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    user: User;
  }
}
