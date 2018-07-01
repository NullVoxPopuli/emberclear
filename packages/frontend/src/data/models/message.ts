import Model from 'ember-data/model';
import { attr, belongsTo, hasMany } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';
import MessageMedia from 'emberclear/data/models/message-media';

export default class Message extends Model {
  @attr('string') from!: string;
  @attr('string') to!: string;
  @attr('string') body!: string;
  @attr('string') contentType!: string;
  @attr('string') type!: string;

  @attr('string') channel!: string;
  @attr('string') thread!: string;

  @attr('date') receivedAt?: Date;
  @attr('date') sentAt!: Date;
  @attr('string') sendError?: string;

  @belongsTo('identity') sender?: Identity;
  // TODO: come up with different word.. medias is weird
  @hasMany('message-media') medias?: MessageMedia;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'message': Message;
  }
}
