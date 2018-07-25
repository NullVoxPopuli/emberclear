import Component from '@ember/component';
import { later } from '@ember/runloop';
import { action } from '@ember-decorators/object';
import { task } from 'ember-concurrency-decorators';

import { isElementWithin } from 'emberclear/src/utils/dom/utils';

export default class ChatHistory extends Component {
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
    const element = this.element.querySelector('.messages')!;
    const messages = element.querySelectorAll('.message')!;
    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }

    this.updateVisibilityOfNewMessageNotifier.perform();
  }

  @task
  * updateVisibilityOfNewMessageNotifier(this: ChatHistory) {
    const container = this.element.querySelector('.message-list') as HTMLElement;
    const messages = this.element.querySelectorAll('.message')!;
    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      const isVisible = isElementWithin(lastMessage, container);

      this.set('isLastVisible', isVisible);
    }
  }
}
