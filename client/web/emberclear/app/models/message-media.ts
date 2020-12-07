import Model, { attr, belongsTo } from '@ember-data/model';

import type Message from 'emberclear/models/message';

export default class MessageMedia extends Model {
  @attr('string') url?: string;
  @attr('string') mime?: string;

  @belongsTo('message', { async: false }) message?: Message;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'message-media': Message;
  }
}
