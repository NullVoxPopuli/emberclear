import Ember from 'ember';
import Component, { tracked } from 'sparkles-component';
import { service } from '@ember-decorators/service';
import { timeout } from 'ember-concurrency';
import { keepLatestTask } from 'ember-concurrency-decorators';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/src/data/models/message/model';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';

interface IArgs {
  to: Identity | Channel;
  messages: Message[];
}

export default class ChatHistory extends Component<IArgs> {
  @service chatScroller!: ChatScroller;

  @tracked isLastVisible = true;

  didInsertElement() {
    this.autoScrollToBottom.perform();
  }

  scrollToBottom() {
    this.chatScroller.scrollToBottom();
  }

  // This watches to see if we have scrolled up, and shows the
  // quick link to jump to the bottom.
  @keepLatestTask * autoScrollToBottom(this: ChatHistory) {

    while(true) {
      yield timeout(250);

      const isScrolledToBottom = this.chatScroller.isLastVisible();

      this.isLastVisible = isScrolledToBottom;

      // HACK: remove eventually....
      // http://ember-concurrency.com/docs/testing-debugging/
      if (Ember.testing) { return; }
    }
  }
}
