import Component from '@ember/component';
import { later } from '@ember/runloop';
import { action } from '@ember-decorators/object';

function isElementInViewport(element, container) {
  var rect = element.getBoundingClientRect();
  var containerRect = container.getBoundingClientRect();

  const isVisible = (
    rect.top >= containerRect.top &&
    rect.left >= containerRect.left &&
    rect.bottom <= containerRect.bottom &&
    rect.right <= containerRect.right
  );

  return isVisible;
}

export default class ChatHistory extends Component {
  isLastVisible = true;

  didRender() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier());
  }

  @action
  onLastReached() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier());
  }

  @action
  onLastVisibleChanged() {
    later(this, () => this.updateVisibilityOfNewMessageNotifier());
  }

  @action
  scrollToBottom() {
    const element = this.element.querySelector('.messages')!;
    const messages = element.querySelectorAll('.message')!;
    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }

    this.updateVisibilityOfNewMessageNotifier();
  }

  private updateVisibilityOfNewMessageNotifier(this: ChatHistory) {
    const container = this.element.querySelector('.message-list')!;
    const messages = this.element.querySelectorAll('.message')!;
    const lastMessage = messages[messages.length - 1] as HTMLElement;
    const isVisible = isElementInViewport(lastMessage, container);

    this.set('isLastVisible', isVisible);
  }
}
