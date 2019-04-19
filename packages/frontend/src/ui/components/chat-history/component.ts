import Ember from 'ember';
import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { timeout, task } from 'ember-concurrency';

import ChatScroller from 'emberclear/services/chat-scroller';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';

interface IArgs {
  to: Identity | Channel;
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
  @(task(function*(this: ChatHistory) {
    while (true) {
      yield timeout(250);

      const isScrolledToBottom = this.chatScroller.isLastVisible();

      this.isLastVisible = isScrolledToBottom;

      // HACK: remove eventually....
      // http://ember-concurrency.com/docs/testing-debugging/
      if (Ember.testing) {
        return;
      }
    }
  }).keepLatest())
  autoScrollToBottom;
}
