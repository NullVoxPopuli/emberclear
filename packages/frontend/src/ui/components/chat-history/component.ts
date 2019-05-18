import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Channel from 'emberclear/src/data/models/channel';
import Contact from 'emberclear/src/data/models/contact/model';
import Message from 'emberclear/src/data/models/message/model';

interface IArgs {
  to: Contact | Channel;
  messages: Message[];
}

export default class ChatHistory extends Component<IArgs> {
  @service chatScroller!: ChatScroller;

  @tracked isLastVisible = true;

  @action scrollToBottom() {
    this.chatScroller.scrollToBottom();
    this.determineIfLastIsVisible();
  }

  @action determineIfLastIsVisible() {
    const { messages } = this.args;
    const lastMessage = messages[messages.length - 1];

    const isScrolledToBottom = this.chatScroller.isLastVisible(lastMessage);

    this.isLastVisible = isScrolledToBottom;
  }
}
