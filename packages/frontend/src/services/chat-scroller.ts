import Service from '@ember/service';

import { isElementWithin } from 'emberclear/src/utils/dom/utils';

export default class ChatScroller extends Service {

  // if the last message is close enough to being in view,
  // scroll to the bottom
  maybeNudgeToBottom(appendedMessage: HTMLElement) {
    if (this.shouldScroll(appendedMessage)) {
      this.scrollToBottom();
    }
  }

  isLastVisible() {
    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    const messages = container.querySelectorAll('.message')!;
    if (!messages) return false;

    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      return isElementWithin(lastMessage, container);
    }

    return false;
  }

  scrollToBottom() {
    const element = document.querySelector('.messages')!;

    element.scrollTo(0, element.scrollHeight);
  }

  private shouldScroll(appendedMessage: HTMLElement) {
    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    if (appendedMessage) {
      const rect = appendedMessage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const isJustOffScreen = (
        rect.top + rect.bottom >= containerRect.top
      );

      return isJustOffScreen;
    }

    // Can something that doesn't exist be visible?
    return false;
  }
}
