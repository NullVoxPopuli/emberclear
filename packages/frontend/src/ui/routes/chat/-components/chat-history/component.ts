import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';

import MessagePersistence from 'emberclear/services/messages/persistence';
import Message from 'emberclear/data/models/message';

export default class ChatHistory extends Component {
  @service('messages/persistence') messagePersistence!: MessagePersistence;

  @alias('messagePersistence.messages.all') messages!: Message[];

  didRender() {
    this.scrollMessagesContainer();
  }

  scrollMessagesContainer() {
    const element = this.element.querySelector('.messages') as HTMLElement;
    const lastMessage = element.querySelector('.message:last-child') as HTMLElement;

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }
  }
}
