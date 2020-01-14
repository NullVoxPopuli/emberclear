import Model, { attr } from '@ember-data/model';
import { toHex } from 'emberclear/utils/string-encoding';

export interface PublicKey {
  publicKey: Uint8Array;
}

export default class Identity extends Model implements Partial<PublicKey> {
  @attr() name!: string;
  @attr() publicKey!: Uint8Array;
  @attr() verified!: boolean;

  get publicKeyAsHex() {
    return toHex(this.publicKey);
  }

  get verification() {
    return this.verified ? 'models.identity.verified' : 'models.identity.unverified';
  }

  get uid() {
    return this.publicKeyAsHex;
  }

  get displayName() {
    const name = this.name;
    const shortKey = this.publicKeyAsHex.substring(0, 8);

    return `${name} (${shortKey})`;
  }

  // @hasMany('message', { async: false }) messages!: unknown[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    identity: Identity;
  }
}
