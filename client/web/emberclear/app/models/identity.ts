import { hasMany } from '@ember-data/model';

import { Identity as LocalIdentity } from '@emberclear/local-account';

import type ChannelContextChain from './channel-context-chain';
import type VoteChain from './vote-chain';

export interface PublicKey {
  publicKey: Uint8Array;
  publicSigningKey: Uint8Array;
}

export default class EmberclearIdentity extends LocalIdentity {
  // Unused, but necessary to properly set up relationships, therefore async
  // eslint-disable-next-line prettier/prettier
  @hasMany('channel-context-chain', { async: true, inverse: 'admin' })
  adminOf?: ChannelContextChain;
  // eslint-disable-next-line prettier/prettier
  @hasMany('channel-context-chain', { async: true, inverse: 'members' })
  memberOf?: ChannelContextChain;
  @hasMany('vote-chain', { async: true, inverse: 'target' }) targetOfVote?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'key' }) voterOf?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'yes' }) votedYesIn?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'no' }) votedNoIn?: VoteChain;
  @hasMany('vote-chain', { async: true, inverse: 'remaining' }) stillRemainingIn?: VoteChain;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    identity: EmberclearIdentity;
  }
}
