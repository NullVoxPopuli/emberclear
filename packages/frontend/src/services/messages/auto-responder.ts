import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/src/services/messages/dispatcher';
import MessageFactory from 'emberclear/src/services/messages/factory';
import Message from 'emberclear/src/data/models/message/model';

/**
 * Nothing here should be blocking, as these responses should not matter
 * to the receiver, but are for the sender's benefit.
 *
 * It is up to the invoker to not await these methods.
 * */
export default class MessageAutoResponder extends Service {
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('messages/factory') factory!: MessageFactory;

  async messageReceived(respondToMessage: Message) {
    const sender = await respondToMessage.sender;
    const response = this.factory.buildDeliveryConfirmation(respondToMessage);

    this.dispatcher.sendToUser.perform(response, sender);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/auto-responder': MessageAutoResponder
  }
}
