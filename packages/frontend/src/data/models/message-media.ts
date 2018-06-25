import Model from 'ember-data/model';

import { attr, belongsTo } from '@ember-decorators/data';

import Message from 'emberclear/data/models/message';

export default class MessageMedia extends Model {
  @attr('string') url?: string;
  @attr('string') mime?: string;

  @belongsTo('message') message?: Message;
}
