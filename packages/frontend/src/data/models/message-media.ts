import Model from 'ember-data/model';

import { attr, belongsTo } from '@ember-decorators/data';

import Message from 'emberclear/data/models/message';

export default class MessageMedia extends Model {
  @attr('string') url?: string;
  @attr('string') mime?: string;

  @belongsTo('message', { async: false }) message?: Message;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'message-media': Message;
  }
}
