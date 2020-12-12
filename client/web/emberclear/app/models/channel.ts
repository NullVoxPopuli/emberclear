import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import type ChannelContextChain from './channel-context-chain';
import type Vote from './vote';

export default class Channel extends Model {
  @attr() name!: string;

  // Optional super-private channel.
  // provides an additional layer of encryption
  // to protect from other people you trust, but
  // maybe don't trust *that* much.
  // TODO: implement this.
  // @attr() public protected!: boolean;
  // @attr() decryptionKey!: string;

  @hasMany('vote', { async: false }) activeVotes!: Vote[];
  @belongsTo('channel-context-chain', { async: false }) contextChain!: ChannelContextChain;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    channel: Channel;
  }
}
