import Model from 'ember-data/model';

import { attr, belongsTo } from '@ember-decorators/data';

export default class MessageMedia extends Model {
  @attr('string') url?: string;
  @attr('string') mime?: string;
}
