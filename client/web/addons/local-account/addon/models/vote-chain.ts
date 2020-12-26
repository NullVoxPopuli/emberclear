import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

import type ChannelContextChain from './channel-context-chain';
import type Identity from './identity';
import type Vote from './vote';

export enum VOTE_ACTION {
  ADD = 'add',
  REMOVE = 'remove',
  PROMOTE = 'promote',
}

// TODO: CLEAN THIS UP
//       SEE README
export default class VoteChain extends Model {
  @hasMany('identity', { async: false, inverse: 'stillRemainingIn' }) remaining!: Identity[];
  @hasMany('identity', { async: false, inverse: 'votedYesIn' }) yes!: Identity[];
  @hasMany('identity', { async: false, inverse: 'votedNoIn' }) no!: Identity[];

  @belongsTo('identity', { async: false, inverse: 'targetOfVote' }) target!: Identity;

  @attr() action!: VOTE_ACTION;
  @belongsTo('identity', { async: false, inverse: 'voterOf' }) key!: Identity;
  @belongsTo('vote-chain', { async: false, inverse: 'parentChain' }) previousVoteChain!: VoteChain;

  @attr() signature!: Uint8Array;

  // Unused, but necessary to properly set up relationships, therefore async
  @belongsTo('vote-chain', { async: true, inverse: 'previousVoteChain' }) parentChain!: VoteChain;
  @belongsTo('channel-context-chain', { async: true }) supports!: ChannelContextChain;
  @belongsTo('vote', { async: true }) wrappedIn!: Vote;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'vote-chain': VoteChain;
  }
}
