import Component from '@ember/component';
import { later } from '@ember/runloop';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

import { isElementWithin } from 'emberclear/src/utils/dom/utils';

import ChatScroller from 'emberclear/services/chat-scroller';

export default class ChatHistory extends Component {
  @service chatScroller!: ChatScroller;

  isLastVisible = true;

  didRender() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier.perform());
  }

  @action
  onLastReached() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier.perform());
  }

  @action
  onLastVisibleChanged() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier.perform());
  }

  @action
  scrollToBottom() {
    this.chatScroller.scrollToBottom();

    this.updateVisibilityOfNewMessageNotifier.perform();
  }

  @task
  * updateVisibilityOfNewMessageNotifier(this: ChatHistory) {
    const isVisible = this.chatScroller.isSecondToLastVisible();

    this.set('isLastVisible', isVisible);
  }
}
