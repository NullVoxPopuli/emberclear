import Component from '@ember/component';

import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessagePersistence from 'emberclear/services/messages/persistence';

export default class MessageEntry extends Component {
  @service store;
  @service('messages/persistence') messagePersistence!: MessagePersistence;

  @action
  send() {
    let msg = this.store.createRecord('message',{
      from: 'Me',
      body: 'hello',
      sentAt: new Date(),
      receivedAt: new Date()
    });

    this.messagePersistence.append(msg);
  }
}
