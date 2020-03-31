import Model, { attr, hasMany } from '@ember-data/model';

import Identity from 'emberclear/models/identity';
import Vote from './vote';

export default class ChannelContextChain extends Model {
  @attr() admin!: Identity;
  @hasMany('identity', { async: false }) members!: Identity[];
  @attr() supportingVote!: Vote;
  @attr() previousChain!: ChannelContextChain;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'channel-context-chain': ChannelContextChain;
  }
}
