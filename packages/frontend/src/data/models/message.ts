import Model from 'ember-data/model';
import { attr, belongsTo } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity';

export default class Message extends Model {
  @attr('string') from?: string;
  @attr('string') to?: string;
  @attr('string') body?: string;
  @attr('string') contentType?: string;

  @attr('string') channel?: string;
  @attr('string') thread?: string;

  @attr('date') receivedAt?: Date;
  @attr('date') sentAt?: Date;

  @belongsTo('identity') sender?: Identity;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'message': Message;
  }
}
