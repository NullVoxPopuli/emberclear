import Service, { inject as service } from '@ember/service';

import { isContact } from '@emberclear/local-account/utils';
import { MESSAGE_LIMIT, TARGET, TYPE } from '@emberclear/networking/models/message';
import { isMessageDMBetween, messagesForDM } from '@emberclear/networking/models/message/utils';

import type MessageFactory from './factory';
import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';
import type ContactManager from '@emberclear/local-account/services/contact-manager';
import type { Message } from '@emberclear/networking';
import type AutoResponder from '@emberclear/networking/services/messages/auto-responder';
import type StatusManager from '@emberclear/networking/services/status-manager';
import type { P2PMessage } from '@emberclear/networking/types';

export default class ReceivedMessageHandler extends Service {
  @service declare store: StoreService;
  @service declare currentUser: CurrentUserService;
  @service declare contactManager: ContactManager;
  @service declare statusManager: StatusManager;
  @service('messages/factory') declare messageFactory: MessageFactory;
  @service('messages/auto-responder') declare autoResponder: AutoResponder;

  async handle(raw: P2PMessage) {
    let message = await this.decomposeMessage(raw);

    if (!message) {
      console.info('Message could not be decomposed', raw);

      return;
    }

    switch (message.type) {
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

  private async handleDeliveryConfirmation(message: Message, raw: P2PMessage) {
    const targetMessage = await this.store.findRecord('message', raw.to);

    // targetMessage.set('confirmationFor', message);
    // TODO: see if ember data relationships can use normal push
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (message.deliveryConfirmations as any).pushObject(targetMessage);

    // blocking?
    await message.save();

    return message;
  }

  private async handleInfoChannelInfo(message: Message, _raw: P2PMessage) {
    return message;
  }

  private async handleDisconnect(message: Message) {
    // non-blocking
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.statusManager.markOffline(message.from);
  }

  private async handleChat(message: Message, raw: P2PMessage) {
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
    }

    return message;
  }

  private async handleChannelChat(message: Message, _raw: P2PMessage) {
    // TODO: if message is a channel message, deconstruct the channel info

    return message;
  }

  private async decomposeMessage(json: P2PMessage) {
    let { id, sender: senderInfo } = json;

    let sender = await this.findOrCreateSender(senderInfo);

    if (!isContact(sender)) {
      return;
    }

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

        await Promise.all(oldMessages.map((oldMessage: Message) => oldMessage.destroyRecord()));
      }
    }
  }

  private async findOrCreateSender(senderData: { uid: string; name: string }) {
    const { name, uid } = senderData;

    if (uid === this.currentUser.uid) {
      return this.currentUser.record;
    }

    return await this.contactManager.findOrCreate(uid, name);
  }
}

declare module '@ember/service' {
  interface Registry {
    'messages/handler': ReceivedMessageHandler;
  }
}
