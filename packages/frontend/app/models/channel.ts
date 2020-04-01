import Model, { attr, hasMany } from '@ember-data/model';

import Identity from 'emberclear/models/identity';
import ChannelContextChain from './channel-context-chain';
import VoteChain from './vote-chain';
// import Invitation from 'emberclear/models/invitation';

export default class Channel extends Model {
  @attr() name!: string;

  // Optional super-private channel.
  // provides an additional layer of encryption
  // to protect from other people you trust, but
  // maybe don't trust *that* much.
  // TODO: implement this.
  // @attr() public protected!: boolean;
  // @attr() decryptionKey!: string;

  @hasMany('identity', { async: false }) members!: Identity[];
  @attr() admin!: Identity;
  @hasMany('vote-chain', { async: false }) activeVotes!: VoteChain[];
  @attr() contextChain!: ChannelContextChain;
  // @hasMany('invitation', { async: false }) pendingInvitations!: Invitation[];
  // @hasMany('identity', { async: false }) blacklisted!: Identity[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    channel: Channel;
  }
}
