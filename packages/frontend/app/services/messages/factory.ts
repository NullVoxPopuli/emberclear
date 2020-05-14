import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { v4 as uuid } from 'uuid';

import CurrentUserService from 'emberclear/services/current-user';

import { TYPE, TARGET } from 'emberclear/models/message';
import Identity from 'emberclear/models/identity';
import Channel from 'emberclear/models/channel';
import Message from 'emberclear/models/message';
import { buildChannelInfo, buildVote } from '../channels/-utils/channel-factory';
import Vote from 'emberclear/models/vote';

export default class MessageFactory extends Service {
  @service store!: any;
  @service currentUser!: CurrentUserService;

  buildNewReceivedMessage(json: StandardMessage, sender: Identity) {
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
      // TODO flesh this out for regular channel messages.
      attributes = {
        target: TARGET.CHANNEL,
        to: to.id,
        channelInfo: buildChannelInfo(to),
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

  buildChannelVote(vote: Vote, to: Channel) {
    let attributes = {
      to: to.id,
      metadata: buildVote(vote),
      channelInfo: buildChannelInfo(to),
    };
    return this.build({
      type: TYPE.CHANNEL_VOTE,
      ...attributes,
    });
  }

  buildChannelInfoSyncRequest(to: Channel) {
    return this.build({
      type: TYPE.INFO_CHANNEL_SYNC,
      to: to.id,
      channelInfo: buildChannelInfo(to),
    });
  }

  buildChannelInfoSyncFulfill(to: Identity, data: Channel) {
    return this.build({
      type: TYPE.INFO_CHANNEL_SYNC,
      to: to.uid,
      body: 'TODO make this better', //TODO decide if there is a better way to indicate request vs fulfill
      channelInfo: buildChannelInfo(data),
    });
  }

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

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/factory': MessageFactory;
  }
}
