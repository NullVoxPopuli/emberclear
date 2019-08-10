import Service from '@ember/service';
import { inject as service } from '@ember/service';
import uuid from 'uuid';

import CurrentUserService from 'emberclear/services/current-user';

import { TYPE, TARGET } from 'emberclear/models/message';
import Identity from 'emberclear/models/identity';
import Channel from 'emberclear/models/channel';
import Message from 'emberclear/models/message';

export default class MessageFactory extends Service {
  @service store!: any;
  @service currentUser!: CurrentUserService;

  buildChat(text: string, to: Identity | Channel) {
    let attributes = {};

    if (to instanceof Identity) {
      attributes = { target: TARGET.WHISPER, to: to.uid };
    } else if (to instanceof Channel) {
      attributes = {
        traget: TARGET.CHANNEL,
        to: to.id,
        // TODO: serialize channel info
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
