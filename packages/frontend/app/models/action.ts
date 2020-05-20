import Model, { attr } from '@ember-data/model';

import VoteChain from 'emberclear/models/vote-chain';

export enum ACTION_RESPONSE {
  NONE = 'none',
  APPROVED = 'approved',
  DENIED = 'denied',
  DISMISSED = 'dismissed',
}

export default class Action extends Model {
  @attr() vote!: VoteChain;
  @attr() response!: ACTION_RESPONSE;
  @attr() timestamp!: Date;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    action: Action;
  }
}
