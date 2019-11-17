import StoreService from 'ember-data/store';
import Service, { inject as service } from '@ember/service';

import Identity from 'emberclear/models/identity';
import Notifications from 'emberclear/services/notifications';
import Message, { TYPE, TARGET, MESSAGE_LIMIT } from 'emberclear/models/message';
import CurrentUserService from 'emberclear/services/current-user';

import StatusManager from 'emberclear/services/status-manager';
import ContactManager from 'emberclear/services/contact-manager';
import AutoResponder from 'emberclear/services/messages/auto-responder';
import { isMessageDMBetween, messagesForDM } from 'emberclear/models/message/utils';

export default class ReceivedMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;
  @service statusManager!: StatusManager;
  @service currentUser!: CurrentUserService;
  @service contactManager!: ContactManager;
  @service('messages/auto-responder') autoResponder!: AutoResponder;

  async handle(raw: RelayJson) {
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

      case TYPE.INFO_CHANNEL_SYNC:
        return this.handleInfoChannelInfo(message, raw);

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

  private async handleDeliveryConfirmation(message: Message, raw: RelayJson) {
    const targetMessage = await this.store.findRecord('message', raw.to);

    // targetMessage.set('confirmationFor', message);
    message.deliveryConfirmations!.pushObject(targetMessage);

    // blocking?
    await message.save();

    return message;
  }

  private async handleInfoChannelInfo(message: Message, _raw: RelayJson) {
    return message;
  }

  private async handleDisconnect(message: Message) {
    this.statusManager.markOffline(message.from);
  }

  private async handleChat(message: Message, raw: RelayJson) {
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

    const name = message.sender!.name;
    const msg = this.intl.t('ui.notifications.from', { name });

    this.notifications.info(msg);

    return message;
  }

  private async handleChannelChat(message: Message, _raw: RelayJson) {
    // TODO: if message is a channel message, deconstruct the channel info

    return message;
  }

  private async decomposeMessage(json: RelayJson) {
    let { id, sender: senderInfo } = json;

    let sender = await this.findOrCreateSender(senderInfo);

    this.statusManager.markOnline(sender);
    this.autoResponder.cameOnline(sender);

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
      return this.buildNewReceivedMessage(json, sender);
    }
  }

  private buildNewReceivedMessage(json: RelayJson, sender: Identity) {
    const { id, type, target, message: msg } = json;

    const message = this.store.createRecord('message', {
      id,
      type,
      target,
      sender,
      from: sender.uid,
      to: this.currentUser.uid,
      sentAt: new Date(json.time_sent),
      receivedAt: new Date(),
      body: msg.body,
      // thread: msg.thread,
      contentType: msg.contentType,
    });

    return message;
  }

  /**
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

        await Promise.all(oldMessages.map(oldMessage => oldMessage.destroyRecord()));
      }
    }
  }

  private async findOrCreateSender(senderData: RelayJson['sender']): Promise<Identity> {
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
