import Model from 'ember-data/model';
import { attr, belongsTo, hasMany } from '@ember-decorators/data';

import Identity from 'emberclear/data/models/identity/model';

/**
 * types:
 *
 * CHAT:       a standard message sent to a person or room.
 *
 * EMOTE:      same as chat, but with special formatting for
 *             talking about oneself in the 3rd person.
 *
 * WHISPER:    same as chat, but explictly only intended for a single person
 *
 * PING:       a system message used to determine who is online upon app-boot
 *
 * DELIVERY_CONFIRMATION: a system message automatically sent back to someone
 *                        who sent you a message so that they know you received it
 *
 * DISCONNECT: a courtesy message to notify your contacts that you
 *             are about to go offline.
 *
 * Properties of:
 *   Chat, Emote
 *   - channel: the id of the channel this message is intended for
 *              NOTE: additional channel properties (such as encryption, members, etc)
 *                    will ultimately be stored on the channel.
 *                    However, in order to make sure everyone's member list is up to date,
 *                    the member list will be sent along wich each message
 *              TODO: decide whether these extra properties live in the body json
 *              TODO: do we want structureless data in the body?
 *
 *   Whisper, Ping, Disconnect
 *   - no properties that alter behavior / message routing
 *
 * Currently Unused Properties:
 *  - contentType, thread
 *
 * Currently Unused Message Types:
 *  - emote, delivery confirmation
 *
 * */

export enum TYPE {
  CHAT = 'chat',
  EMOTE = 'emote',
  PING = 'ping',
  DISCONNECT = 'disconnect',
  DELIVERY_CONFIRMATION = 'delivery-confirmation',
}

export enum TARGET {
  NONE = '',
  WHISPER = 'whisper',
  CHANNEL = 'channel',
  MESSAGE = 'message',
}


/**
 * NOTE:
 * GUID - used for message receipts / delivery confirmation
 *        and threads
 * */
export default class Message extends Model {

  /**
   * from: the id of an identity
   * */
  @attr() from!: string;

  /**
   * identityId | channelId | messageId
   *
   * TODO: should these have different formats?;
   * */
  @attr() to!: string;

  /**
   * Contents of body may depend on the TYPE/TARGET
   * */
  @attr() body!: string;

  /**
   * Additional information for aiding in protocols
   *
   * For example:
   *
   *   In channel messages the following needs to be included,
   *    - the creator of the channel
   *    - the member list
   *    - invites are pending
   *      - who in the channel has approved the invites (for consensus)
   *    - blacklisted members (blacklist by consensus as well)
   *
   *    TODO: maybe in the first iteration of channels, just the channel creator
   *          can perform memberlist changes
   * */
  @attr() metadata!: object;


  @attr() type!: TYPE;
  @attr() target!: TARGET;

  @attr() thread!: string;

  @attr() receivedAt?: Date;
  @attr() sentAt!: Date;
  @attr() sendError?: string;

  @belongsTo('identity', { async: true }) sender?: Identity;

  // @belongsTo('message', { async: false, inverse: 'deliveryConfirmations' }) confirmationFor?: Message;
  // @hasMany('message', { async: false, inverse: 'confirmationFor' }) deliveryConfirmations?: Message[];
  @hasMany('message', { async: false }) deliveryConfirmations?: Message[];


  // currently unused
  @attr() contentType!: string;

}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'message': Message;
  }
}
