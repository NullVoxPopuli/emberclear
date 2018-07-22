import Model from 'ember-data/model';
import { attr, belongsTo, hasMany } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';
import MessageMedia from 'emberclear/data/models/message-media';

export enum MESSAGE_TYPE {
  CHAT = 'chat',
  EMOTE = 'emote',
  WHISPER = 'whisper',
  PING = 'ping',
  DISCONNECT = 'disconnect'
}


export default class Message extends Model {
  @attr('string') from!: string;
  @attr('string') to!: string;
  @attr('string') body!: string;
  @attr('string') contentType!: string;

  // the type of message being sent:
  //  - chat - broadcast to all a person's contacts
  //  - emote - a specialized chat message that is broadcasted
  //            to all a person's contacts
  //  - whisper - send a message to only one person
  //  - ping - lightweight message to determine if
  //          someone is online and what their current name is.
  //  - disconnect - announce a disconnect to your connections
  @attr('string') type!: string;

  @attr('string') channel!: string;
  @attr('string') thread!: string;

  @attr('date') receivedAt?: Date;
  @attr('date') sentAt!: Date;
  @attr('string') sendError?: string;

  @belongsTo('identity', { async: false }) sender?: Identity;
  // TODO: come up with different word.. medias is weird
  // @hasMany('message-media') medias?: MessageMedia;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'message': Message;
  }
}
