import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
// import DS from 'ember-data';
// const { attr, hasMany } = DS;

import Identity from 'emberclear/data/models/identity/model';
import Invitation from 'emberclear/data/models/invitation';

export default class Channel extends Model {
  @attr() name!: string;

  // Optional super-private channel.
  // provides an additional layer of encryption
  // to protect from other people you trust, but
  // maybe don't trust *that* much.
  // TODO: implement this.
  @attr() public protected!: boolean;
  @attr() decryptionKey!: string;

  @hasMany('identity', { async: false }) members!: Identity[];
  @hasMany('invitation', { async: false }) pendingInvitations!: Invitation[];
  @hasMany('identity', { async: false }) blacklisted!: Identity[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    channel: Channel;
  }
}
