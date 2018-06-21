import DS from 'ember-data';
import Array from '@ember/array/mutable';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import Message from 'emberclear/data/models/message';

interface MessageCache {
  all: Array<Message>
}

// NOTE: this would be easier to manage / reason about
//       in redux, but as the message pool grows,
//       the pains of the immutability pattern also grow.
//       This uses mutable objects to reduce memory
//       footprint
//
// TODO: do I still need this?
//       I think ember-data handles everything I would have
//       implemented in here
export default class MessagePersistence extends Service {
  @service store!: DS.Store;

  // collections of all messages for every channel
  messages: MessageCache = {
    all: []
  };

  append(this: MessagePersistence, msg: Message) {
    // const channel = msg.channel;

    // this.messages.all.pushObject(msg);

    // this.get(`messages.${channel}`).pushObject(msg);
  }

  // getMessages(this: MessagePersistence, channel = '', thread = '') {
  //   const msgs = this.store.peekAll('message');
  //
  //   this.set('messages.all', msgs);
  //
  //   return msgs;
  // }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/persistence': MessagePersistence
  }
}
