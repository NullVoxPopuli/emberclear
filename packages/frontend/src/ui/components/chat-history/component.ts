import Ember from 'ember';
import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { timeout } from 'ember-concurrency';
import { keepLatestTask } from 'ember-concurrency-decorators';

import ChatScroller from 'emberclear/services/chat-scroller';

export default class ChatHistory extends Component {
  @service chatScroller!: ChatScroller;

  isLastVisible = true;

  didInsertElement() {
    this.autoScrollToBottom.perform();
  }

  @action
  scrollToBottom() {
    this.chatScroller.scrollToBottom();
  }

  // This watches to see if we have scrolled up, and shows the
  // quick link to jump to the bottom.
  @keepLatestTask * autoScrollToBottom(this: ChatHistory) {

    while(true) {
      yield timeout(250);

      const isScrolledToBottom = this.chatScroller.isLastVisible();

      this.set('isLastVisible', isScrolledToBottom);

      // HACK: remove eventually....
      // http://ember-concurrency.com/docs/testing-debugging/
      if (Ember.testing) { return; }
    }
  }
}
