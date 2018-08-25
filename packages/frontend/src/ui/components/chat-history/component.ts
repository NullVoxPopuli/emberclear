import Ember from 'ember';
import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

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

  @task
  * autoScrollToBottom(this: ChatHistory) {
    const messages = this.element.querySelector('.messages') as HTMLElement;

    while(true) {
      yield timeout(250);

      // allow 1px inaccuracy by adding 1
      const { scrollHeight, clientHeight, scrollTop } = messages;
      const isScrolledToBottom = scrollHeight - clientHeight <= scrollTop + 10;

      if (isScrolledToBottom) {
        messages.scrollTop = scrollHeight - clientHeight;
      }

      this.set('isLastVisible', isScrolledToBottom);

      // HACK: remove eventually....
      // http://ember-concurrency.com/docs/testing-debugging/
      if (Ember.testing) { return; }
    }
  }
}
