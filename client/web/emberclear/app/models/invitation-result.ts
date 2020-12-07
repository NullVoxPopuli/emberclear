import Model, { attr, belongsTo } from '@ember-data/model';

import type Identity from 'emberclear/models/identity';

export default class InvitationResult extends Model {
  @attr() createdAt!: Date;
  @attr() isApproved!: boolean;

  @belongsTo('invitation', { async: false }) invitation!: Identity;
  @belongsTo('identity', { async: false }) responder!: Identity[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'invitation-result': InvitationResult;
  }
}
