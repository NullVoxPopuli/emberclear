import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type ChatScroller from 'emberclear/services/chat-scroller';
import { taskFor } from 'ember-concurrency-ts';

export default class ChatNewMessages extends Component {
  @service chatScroller!: ChatScroller;

  @action
  scrollToBottom() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.chatScroller.scrollToBottom).perform();
  }
}
