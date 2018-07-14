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
    const messages = element.querySelectorAll('.message');
    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      console.log('total message height: ', [].slice.call(messages).map(m => m.offsetHeight).reduce((a, m) => m+a, 0));
      console.log('container scrollHeight: ', element.scrollHeight, 'container scrollTop: ', element.scrollTop);
      console.log('lastMessage.offsetHeight: ', lastMessage.offsetHeight, 'lastMessage.offsetTop: ', lastMessage.offsetTop);
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight * 20000;
    }
  }
}
