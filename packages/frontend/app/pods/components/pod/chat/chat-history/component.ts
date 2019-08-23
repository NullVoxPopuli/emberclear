import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import Message from 'emberclear/models/message';
import { task } from 'ember-concurrency';
import { timeout } from 'ember-concurrency';
import { markAsRead } from 'emberclear/models/message/utils';
import Task from 'ember-concurrency/task';

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

  @task(function*(this: ChatHistory, message: Message) {
    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      if (message.isSaving || !document.hasFocus()) {
        yield timeout(5);
      } else {
        yield markAsRead(message);
        return;
      }
    }
  })
  markRead!: Task;
}
