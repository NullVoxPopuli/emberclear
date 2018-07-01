import Component from '@ember/component';
import { filterBy } from '@ember-decorators/object/computed';

import Message from 'emberclear/data/models/message';

export default class ChatHistory extends Component {

  @filterBy('messages', 'type', 'chat') chatMessages!: Message[];

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
