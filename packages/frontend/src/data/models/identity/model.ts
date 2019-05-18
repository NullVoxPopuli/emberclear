import Model from 'ember-data/model';
import DS from 'ember-data';
const { attr } = DS;
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { toHex } from 'emberclear/src/utils/string-encoding';

export const Status = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy',
};

export enum STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy',
}

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export default class Identity extends Model implements Partial<KeyPair> {
  @attr() name?: string;
  @attr() publicKey?: Uint8Array;
  @attr() privateKey?: Uint8Array;
  @attr() onlineStatus?: STATUS;

  @reads('publicKeyAsHex') uid!: string;

  @computed('publicKey')
  get publicKeyAsHex() {
    if (!this.publicKey) return '';

    return toHex(this.publicKey);
  }

  @computed('name', 'publicKeyAsHex')
  get displayName() {
    const name = this.name;
    const shortKey = this.publicKeyAsHex.substring(0, 8);

    return `${name} (${shortKey})`;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    identity: Identity;
  }
}
