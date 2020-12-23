import Model, { belongsTo, hasMany } from '@ember-data/model';

import type Channel from './channel';
import type Identity from './identity';
import type VoteChain from './vote-chain';

// TODO: CLEAN THIS UP
//       SEE README
export default class ChannelContextChain extends Model {
  @belongsTo('identity', { async: false, inverse: 'adminOf' }) admin!: Identity;
  @hasMany('identity', { async: false, inverse: 'memberOf' }) members!: Identity[];
  @belongsTo('vote-chain', { async: false }) supportingVote!: VoteChain;
  @belongsTo('channel-context-chain', { async: false, inverse: 'parentChain' })
  previousChain!: ChannelContextChain;

  // Unused, but necessary to properly set up relationships, therefore async
  @belongsTo('channel-context-chain', { async: true, inverse: 'previousChain' })
  parentChain!: ChannelContextChain;
  @belongsTo('channel', { async: true }) composesChannel!: Channel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'channel-context-chain': ChannelContextChain;
  }
}
