import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { v4 as uuid } from 'uuid';

import { Identity } from '@emberclear/local-account';
import Channel from '@emberclear/local-account/models/channel';
import { TARGET, TYPE } from '@emberclear/networking/models/message';

import type StoreService from '@ember-data/store';
// import { buildChannelInfo, buildVote } from '../channels/-utils/channel-factory';
import type { CurrentUserService } from '@emberclear/local-account';
// import type Vote from '@emberclear/local-account/models/vote';
import type { Message } from '@emberclear/networking';
import type { P2PMessage } from '@emberclear/networking/types';

export default class MessageFactory extends Service {
  @service declare store: StoreService;
  @service declare currentUser: CurrentUserService;

  buildNewReceivedMessage(json: P2PMessage, sender: Identity) {
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

  buildChat(text: string, to: Identity | Channel) {
    let attributes = {};

    if (to instanceof Identity) {
      attributes = { target: TARGET.WHISPER, to: to.uid };
    } else if (to instanceof Channel) {
      attributes = {
        target: TARGET.CHANNEL,
        to: to.id,
        // channelInfo: buildChannelInfo(to),
      };
    }

    let message = this.build({
      body: text,
      type: TYPE.CHAT,
      // all messages sent are read... beacuse..
      // we sent them, so... they are read already...
      readAt: new Date(),
      ...attributes,
    });

    return message;
  }

  // buildChannelVote(vote: Vote, to: Channel) {
  //   return this.build({
  //     type: TYPE.CHANNEL_VOTE,
  //     to: to.id,
  //     metadata: buildVote(vote),
  //     channelInfo: buildChannelInfo(to),
  //   });
  // }

  // buildChannelInfoSyncRequest(to: Channel) {
  //   return this.build({
  //     type: TYPE.INFO_CHANNEL_SYNC_REQUEST,
  //     to: to.id,
  //     channelInfo: buildChannelInfo(to),
  //   });
  // }

  // buildChannelInfoSyncFulfill(to: Identity, data: Channel) {
  //   return this.build({
  //     type: TYPE.INFO_CHANNEL_SYNC_FULFILL,
  //     to: to.uid,
  //     channelInfo: buildChannelInfo(data),
  //   });
  // }

  buildPing() {
    return this.build({ type: TYPE.PING });
  }

  buildDeliveryConfirmation(forMessage: Message): Message {
    return this.build({
      target: TARGET.MESSAGE,
      type: TYPE.DELIVERY_CONFIRMATION,
      to: forMessage.id,
    });
  }

  private build(attributes = {}) {
    return this.store.createRecord('message', {
      id: uuid(),
      sentAt: new Date(),
      from: this.currentUser.uid,
      sender: this.currentUser.record,
      ...attributes,
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    'messages/factory': MessageFactory;
  }
}
