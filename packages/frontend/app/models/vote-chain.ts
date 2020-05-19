import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

import Identity from 'emberclear/models/identity';
import ChannelContextChain from './channel-context-chain';
import Vote from './vote';

export enum VOTE_ACTION {
  ADD = 'add',
  REMOVE = 'remove',
  PROMOTE = 'promote',
}

export default class VoteChain extends Model {
  @hasMany('identity', { async: false, inverse: 'stillRemainingIn' }) remaining!: Identity[];
  @hasMany('identity', { async: false, inverse: 'votedYesIn' }) yes!: Identity[];
  @hasMany('identity', { async: false, inverse: 'votedNoIn' }) no!: Identity[];
  @belongsTo('identity', { async: false, inverse: 'targetOfVote' }) target!: Identity;
  @attr() action!: VOTE_ACTION;
  @belongsTo('identity', { async: false, inverse: 'voterOf' }) key!: Identity;
  @belongsTo('vote-chain', { async: false, inverse: 'parentChain' }) previousVoteChain?: VoteChain;
  @belongsTo('vote-chain', { async: true, inverse: 'previousVoteChain' }) parentChain?: VoteChain;
  @attr() signature!: Uint8Array;
  @belongsTo('channel-context-chain', { async: true }) supports?: ChannelContextChain;
  @belongsTo('vote', { async: true }) wrappedIn?: Vote;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'vote-chain': VoteChain;
  }
}
