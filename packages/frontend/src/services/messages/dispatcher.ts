import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import Redux from 'emberclear/services/redux';
// import Message from 'emberclear/data/models/message';
import MessagePersistence from 'emberclear/services/messages/persistence';
import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';

export default class MessageDispatcher extends Service {
  @service notifications!: Notifications;
  @service store!: DS.Store;
  @service redux!: Redux;
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;
  @service('messages/persistence') messagePersistence!: MessagePersistence;

  sendMessage(messageText: string) {
    let msg = this.store.createRecord('message',{
      from: this.identity.name,
      body: messageText,
      sentAt: new Date(),
      receivedAt: new Date()
    });

    this.messagePersistence.append(msg);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/dispatcher': MessageDispatcher
  }
}
