import Service from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

import { isElementWithin } from 'emberclear/utils/dom/utils';
import Message from 'emberclear/models/message';

const SCROLL_DELAY = 50;

export default class ChatScroller extends Service {
  // if the last message is close enough to being in view,
  // scroll to the bottom
  @action maybeNudgeToBottom(appendedMessage: HTMLElement) {
    if (this.shouldScroll(appendedMessage)) {
      this.scrollToBottom.perform();
    }
  }

  isLastVisible(message: Message) {
    // nothing to show, don't indicate that the last message isn't visible.
    if (!message) return true;

    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    const messages = container.querySelectorAll('.message')!;
    if (!messages) return false;

    const lastMessage = document.getElementById(message.id);

    if (lastMessage) {
      return isElementWithin(lastMessage, container);
    }

    // nothing to show. last is like... square root of -1... or something.
    // if there are indeed messages, then the last one might be occluded
    return messages.length === 0;
  }


  @(task(function*() {
    yield timeout(SCROLL_DELAY);

    const element = document.querySelector('.messages');

    if (element) {
      element.scrollTo(0, element.scrollHeight);
    }
  }).keepLatest())
  scrollToBottom!: Task;


  private shouldScroll(appendedMessage: HTMLElement) {
    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    if (appendedMessage) {
      const rect = appendedMessage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const isJustOffScreen = rect.top + rect.bottom >= containerRect.top;

      return isJustOffScreen;
    }

    // Can something that doesn't exist be visible?
    return false;
  }
}
