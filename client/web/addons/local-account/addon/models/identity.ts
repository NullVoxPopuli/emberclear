import { tracked } from '@glimmer/tracking';
// see note below -- needs investigating
// eslint-disable-next-line
import { computed } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

import { toHex } from '@emberclear/encoding/string';

import type ChannelContextChain from './channel-context-chain';
import type VoteChain from './vote-chain';
import type { KeyPublic, SigningKeyPublic } from '@emberclear/crypto';

export default class Identity extends Model implements Partial<KeyPublic & SigningKeyPublic> {
  @attr() name!: string;
  @attr() publicKey!: Uint8Array;
  @attr() publicSigningKey!: Uint8Array;

  // non-persisted data
  @tracked numUnread = 0;

  // human-readable data
  get publicKeyAsHex() {
    return toHex(this.publicKey);
  }

  get publicSigningKeyAsHex() {
    return toHex(this.publicSigningKey);
  }

  // Needed otherwise this regularly invalidates
  // TODO: will the public key ever change? who knows
  // eslint-disable-next-line
  @computed()
  get uid() {
    return this.publicKeyAsHex;
  }

  get displayName() {
    const name = this.name;
    const shortKey = this.publicKeyAsHex.substring(0, 8);

    return `${name} (${shortKey})`;
  }

  // TODO: CLEAN THIS UP
  //       SEE README
  // Unused, but necessary to properly set up relationships, therefore async
  // eslint-disable-next-line prettier/prettier
  @hasMany('channel-context-chain', { async: true, inverse: 'admin' })
  adminOf?: ChannelContextChain;
  // eslint-disable-next-line prettier/prettier
  @hasMany('channel-context-chain', { async: true, inverse: 'members' })
  memberOf?: ChannelContextChain;
  @hasMany('vote-chain', { async: true, inverse: 'target' }) targetOfVote?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'key' }) voterOf?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'yes' }) votedYesIn?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'no' }) votedNoIn?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'remaining' }) stillRemainingIn?: VoteChain;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    identity: Identity;
  }
}
