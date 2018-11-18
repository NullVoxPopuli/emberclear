import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { toHex } from 'emberclear/src/utils/string-encoding';

export const Status = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
};

export enum STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy'
}

export default class Identity extends Model {
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
    'identity': Identity;
  }
}
