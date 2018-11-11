import Model from 'ember-data/model';
import { attr, hasMany, belongsTo } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';
import InvitationResult from 'emberclear/data/models/invitation-result';

export default class Invitation extends Model {
  @attr() createdAt!: Date;

  @belongsTo('identity', { async: false }) invited!: Identity;
  @hasMany('invitation-result', { async: false }) results!: InvitationResult[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'invitation': Invitation;
  }
}
