import Model from 'ember-data/model';
import DS from 'ember-data';
const { attr } = DS;
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { toHex } from 'emberclear/src/utils/string-encoding';

export interface PublicKey {
  publicKey: Uint8Array;
}

export default class Identity extends Model implements Partial<PublicKey> {
  @attr() name!: string;
  @attr() publicKey!: Uint8Array;

  @reads('publicKeyAsHex') uid!: string;

  @computed('publicKey')
  get publicKeyAsHex() {
    return toHex(this.publicKey);
  }

  @computed('name', 'publicKeyAsHex')
  get displayName() {
    const name = this.name;
    const shortKey = this.publicKeyAsHex.substring(0, 8);

    return `${name} (${shortKey})`;
  }

  // @hasMany('message', { async: false }) messages!: unknown[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    identity: Identity;
  }
}
