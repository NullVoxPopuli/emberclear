import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

// NOTE: this would be easier to manage / reason about
//       in redux, but as the message pool grows,
//       the pains of the immutability pattern also grow.
//       This uses mutable objects to reduce memory
//       footprint
export default class MessagePersistence extends Service {
  @service store!: DS.Store;

  // collections of all messages for every channel
  messages = {
    all: []
  };

  getMessages(channel = '', thread = '') {
    const msgs = this.store.peekAll('message');

    this.set('messages.all', msgs);

    return msgs;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/persistence': MessagePersistence
  }
}
