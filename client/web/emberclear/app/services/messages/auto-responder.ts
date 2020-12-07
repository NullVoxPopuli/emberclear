import Service from '@ember/service';
import { inject as service } from '@ember/service';
import type StoreService from '@ember-data/store';
import { taskFor } from 'ember-concurrency-ts';

import type MessageDispatcher from 'emberclear/services/messages/dispatcher';
import type MessageFactory from 'emberclear/services/messages/factory';
import type Message from 'emberclear/models/message';
import type Contact from 'emberclear/models/contact';

/**
 * Nothing here should be blocking, as these responses should not matter
 * to the receiver, but are for the sender's benefit.
 *
 * It is up to the invoker to not await these methods.
 * */
export default class MessageAutoResponder extends Service {
  @service('messages/dispatcher') declare dispatcher: MessageDispatcher;
  @service('messages/factory') declare factory: MessageFactory;
  @service declare store: StoreService;

  async messageReceived(respondToMessage: Message) {
    const sender = respondToMessage.sender;
    const response = this.factory.buildDeliveryConfirmation(respondToMessage);

    if (sender) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      taskFor(this.dispatcher.sendToUser).perform(response, sender);
    }
  }

  async cameOnline(contact: Contact) {
    const pendingMessages = await this.store.query('message', {
      queueForResend: true,
      to: contact.uid,
    });

    pendingMessages.forEach(async (message: Message) => {
      message.queueForResend = false;
      await message.save();

      return taskFor(this.dispatcher.sendToUser).perform(message, contact);
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/auto-responder': MessageAutoResponder;
  }
}
