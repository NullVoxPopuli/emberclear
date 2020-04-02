import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import { taskFor } from 'emberclear/utils/ember-concurrency';

export default class ChatNewMessages extends Component {
  @service chatScroller!: ChatScroller;

  @action
  scrollToBottom() {
    taskFor(this.chatScroller.scrollToBottom).perform();
  }
}
