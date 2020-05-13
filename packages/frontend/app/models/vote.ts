import Model, { attr } from '@ember-data/model';
import VoteChain from './vote-chain';

export default class Vote extends Model {
  @attr() voteChain!: VoteChain;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    vote: Vote;
  }
}
