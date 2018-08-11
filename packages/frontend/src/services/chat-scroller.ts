import Service from '@ember/service';

import { isElementWithin } from 'emberclear/src/utils/dom/utils';

export default class ChatScroller extends Service {
  // if the last message is close enough to being in view,
  // scroll to the bottom
  maybeNudgeToBottom() {
    if (this.isSecondToLastVisible() || this.isLastVisible()) {
      this.scrollToBottom();
    }
  }

  isSecondToLastVisible() {
    return this.isMessageAtEndVisible(1);
  }

  isLastVisible() {
    return this.isMessageAtEndVisible(0);
  }

  scrollToBottom() {
    const element = document.querySelector('.messages')!;

    // too much?
    // need to compensate for if we are too far up in the history
    // the last messages will not be rendered
    if (element) {
      element.scrollTop = element.scrollTop * 100000;
    }
  }

  private isMessageAtEndVisible(distanceFromEnd: number): boolean {
    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    const messages = container.querySelectorAll('.message')!;

    if (!messages) return false;

    const index = messages.length - ( distanceFromEnd + 1 );
    const lastMessage = messages[index] as HTMLElement;

    if (lastMessage) {
      return isElementWithin(lastMessage, container);
    }

    // Can something that doesn't exist be visible?
    return false;

  }
}
