import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import Message from 'emberclear/models/message';

interface IArgs {
  to: Contact | Channel;
  messages: Message[];
}

export default class ChatHistory extends Component<IArgs> {
  @service chatScroller!: ChatScroller;

  @action scrollToBottom() {
    this.chatScroller.scrollToBottom.perform();
  }
}
