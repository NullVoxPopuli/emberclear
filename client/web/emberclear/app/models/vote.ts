import Model, { belongsTo } from '@ember-data/model';
import type VoteChain from './vote-chain';
import type { Channel } from 'phoenix';

export default class Vote extends Model {
  @belongsTo('vote-chain', { async: false }) voteChain!: VoteChain;

  // Unused, but necessary to properly set up relationships, therefore async
  @belongsTo('channel', { async: true }) activeVoteIn!: Channel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    vote: Vote;
  }
}
