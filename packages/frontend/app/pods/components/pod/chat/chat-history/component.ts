import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import Message from 'emberclear/models/message';
import Task from 'ember-concurrency/task';

interface IArgs {
  to: Contact | Channel;
  messages: Message[];
}

export default class ChatHistory extends Component<IArgs> {
  @service chatScroller!: ChatScroller;

  @tracked isLastVisible = true;

  @action scrollToBottom() {
    this.chatScroller.scrollToBottom.perform();
    this.determineIfLastIsVisible();
  }

  @action determineIfLastIsVisible() {
    console.debug('Pending fix for did-update');
    // this._setIsLastVisible.perform();
  }

  @(task(function*(this: ChatHistory) {
    yield timeout(250);

    const { messages } = this.args;
    const lastMessage = messages[messages.length - 1];

    const isScrolledToBottom = this.chatScroller.isLastVisible(lastMessage);

    this.isLastVisible = isScrolledToBottom;
  }).restartable())
  _setIsLastVisible!: Task;
}
