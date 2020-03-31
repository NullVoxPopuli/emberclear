import StoreService from '@ember-data/store';
import Service, { inject as service } from '@ember/service';

import Identity from 'emberclear/models/identity';
import Notifications from 'emberclear/services/notifications';
import Message, { TYPE, TARGET, MESSAGE_LIMIT } from 'emberclear/models/message';
import CurrentUserService from 'emberclear/services/current-user';

import StatusManager from 'emberclear/services/status-manager';
import ContactManager from 'emberclear/services/contact-manager';
import AutoResponder from 'emberclear/services/messages/auto-responder';
import { isMessageDMBetween, messagesForDM } from 'emberclear/models/message/utils';
import MessageFactory from './factory';

export default class ReceivedMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;
  @service statusManager!: StatusManager;
  @service currentUser!: CurrentUserService;
  @service contactManager!: ContactManager;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service('messages/auto-responder') autoResponder!: AutoResponder;

  async handle(raw: StandardMessage) {
    let message = await this.decomposeMessage(raw);
    let type = message.type;

    switch (type) {
      case TYPE.CHAT:
        return this.handleChat(message, raw);

      case TYPE.EMOTE:
        return this.handleChat(message, raw);

      case TYPE.DELIVERY_CONFIRMATION:
        return this.handleDeliveryConfirmation(message, raw);

      case TYPE.DISCONNECT:
        return this.handleDisconnect(message);

      case TYPE.INFO_CHANNEL_SYNC_REQUEST:
        return this.handleInfoChannelInfo(message, raw);

      case TYPE.CHANNEL_VOTE:
        return this.handleChannelVote(message, raw);

      case TYPE.PING:
        // do nothing, we do not need to send a response
        // at least for now, we have socket-level tools to know
        // when a message was sent successfully
        return message;

      default:
        console.info('Unrecognized message to handle...', raw);

        return message;
    }
  }

  private async handleDeliveryConfirmation(message: Message, raw: StandardMessage) {
    const targetMessage = await this.store.findRecord('message', raw.to);

    // targetMessage.set('confirmationFor', message);
    message.deliveryConfirmations!.pushObject(targetMessage);

    // blocking?
    await message.save();

    return message;
  }

  private async handleInfoChannelInfo(message: Message, _raw: StandardMessage) {
    // TODO: channel sync code
    return message;
  }

  private async handleChannelVote(message: Message, _raw: StandardMessage) {
    // TODO: channel vote code
    return message;
  }

  private async handleDisconnect(message: Message) {
    // non-blocking
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.statusManager.markOffline(message.from);
  }

  private async handleChat(message: Message, raw: StandardMessage) {
    // non-blocking
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.autoResponder.messageReceived(message);

    switch (message.target) {
      case TARGET.WHISPER:
        return this.handleWhisperChat(message);

      case TARGET.CHANNEL:
        return this.handleChannelChat(message, raw);

      default:
        console.info('TARGET INVALID', raw);

        return message;
    }
  }

  private async handleWhisperChat(message: Message) {
    await this.trimMessages(message);
    await message.save();

    if (message.sender) {
      message.sender.numUnread++;

      let name = message.sender.name;
      let msg = this.intl.t('ui.notifications.from', { name });

      await this.notifications.info(msg);
    }

    return message;
  }

  private async handleChannelChat(message: Message, _raw: StandardMessage) {
    // TODO: if message is a channel message, deconstruct the channel info
    
    return message;
  }

  private async decomposeMessage(json: StandardMessage) {
    let { id, sender: senderInfo } = json;

    let sender = await this.findOrCreateSender(senderInfo);

    await this.statusManager.markOnline(sender);
    await this.autoResponder.cameOnline(sender);

    try {
      // we've already received this message.
      // it's possible to receive the same message multiple
      // times if the sending client doesn't properly
      // make the message as sent
      let existing = await this.store.findRecord('message', id);

      return existing;
    } catch (e) {
      // we have not yet received this message
      // build a new message record
      return this.messageFactory.buildNewReceivedMessage(json, sender);
    }
  }

  /**
   * TODO: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
   * TODO: https://developer.mozilla.org/en-US/docs/Web/API/IDBIndex/openCursor
   *
   * Trims messages for a message group down to 100.... because list occlusion isn't a thing yet
   * on the web (or is very very difficult to implement in JS)
   *
   * @param lastReceived this message is used to determine which chat DM / Channel the message
   *                     belongs to, and which set of messages will be trimmed.
   */
  private async trimMessages(lastReceived: Message): Promise<void> {
    let me = this.currentUser.uid;

    // if the most recently receive message belongs to a stack of DMs,
    // trim the DMs to be at most 100 messages.
    let isApplicableForTrim = isMessageDMBetween(lastReceived, me, lastReceived.from);

    if (isApplicableForTrim) {
      let allMessages = this.store.peekAll('message');
      let forDM = messagesForDM(allMessages, me, lastReceived.from);

      let numTooMany = forDM.length - MESSAGE_LIMIT;

      if (numTooMany > 0) {
        let oldMessages = forDM.splice(0, numTooMany);

        await Promise.all(oldMessages.map((oldMessage) => oldMessage.destroyRecord()));
      }
    }
  }

  private async findOrCreateSender(senderData: StandardMessage['sender']): Promise<Identity> {
    const { name, uid } = senderData;

    if (uid === this.currentUser.uid) {
      return this.currentUser.record!;
    }

    return await this.contactManager.findOrCreate(uid, name);
  }
}

declare module '@ember/service' {
  interface Registry {
    'messages/handler': ReceivedMessageHandler;
  }
}
