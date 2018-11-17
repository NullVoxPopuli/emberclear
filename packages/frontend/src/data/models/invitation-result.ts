import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';

export default class InvitationResult extends Model {
  @attr() createdAt!: Date;
  @attr() isApproved!: boolean;

  @belongsTo('invitation', { async: false }) invitation!: Identity;
  @belongsTo('identity', { async: false }) responder!: Identity[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'invitation-result': InvitationResult;
  }
}
