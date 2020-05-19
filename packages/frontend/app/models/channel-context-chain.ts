import Model, { hasMany, belongsTo } from '@ember-data/model';

import Identity from 'emberclear/models/identity';
import VoteChain from './vote-chain';
import { Channel } from 'phoenix';

export default class ChannelContextChain extends Model {
  @belongsTo('identity', { async: false, inverse: 'adminOf' }) admin!: Identity;
  @hasMany('identity', { async: false, inverse: 'memberOf' }) members!: Identity[];
  @belongsTo('vote-chain', { async: false }) supportingVote!: VoteChain;
  @belongsTo('channel-context-chain', { async: false, inverse: 'parentChain' }) previousChain!: ChannelContextChain;
  @belongsTo('channel-context-chain', { async: true, inverse: 'previousChain' }) parentChain!: ChannelContextChain;
  @belongsTo('channel', { async: true }) composesChannel!: Channel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'channel-context-chain': ChannelContextChain;
  }
}
