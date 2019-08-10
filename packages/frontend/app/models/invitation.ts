import Model from 'ember-data/model';
import DS from 'ember-data';
const { attr, hasMany, belongsTo } = DS;

import Identity from 'emberclear/data/models/identity/model';
import InvitationResult from 'emberclear/data/models/invitation-result';

export default class Invitation extends Model {
  @attr() createdAt!: Date;

  @belongsTo('identity', { async: false }) invited!: Identity;
  @hasMany('invitation-result', { async: false }) results!: InvitationResult[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    invitation: Invitation;
  }
}
