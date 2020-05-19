import Model, { belongsTo } from '@ember-data/model';
import VoteChain from './vote-chain';
import { Channel } from 'phoenix';

export default class Vote extends Model {
  @belongsTo('vote-chain', { async: false }) voteChain!: VoteChain;
  @belongsTo('channel', { async: true }) activeVoteIn!: Channel;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    vote: Vote;
  }
}
