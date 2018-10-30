import Model from 'ember-data/model';
import { attr, hasMany } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';

export default class Channel extends Model {
  @attr('string') name!: string;

  // Optional super-private channel.
  // provides an additional layer of encryption
  // to protect from other people you trust, but
  // maybe don't trust *that* much.
  // TODO: implement this.
  @attr('boolean') protected!: boolean;
  @attr('string') decryptionKey!: string;

  @hasMany('identity')  members!: Identity[];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'channel': Channel;
  }
}
