import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

import { isElementWithin } from 'emberclear/utils/dom/utils';
import Message from 'emberclear/models/message';
import Task from 'ember-concurrency/task';

const SCROLL_DELAY = 20;

export default class ChatScroller extends Service {
  @tracked isLastVisible = true;

  // if the last message is close enough to being in view,
  // scroll to the bottom
  maybeNudgeToBottom(appendedMessage: HTMLElement) {
    this.maybeNudge.perform(appendedMessage);
  }

  _isLastVisible(message: Message) {
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

  @(task(function*(this: ChatScroller, appendedMessage: HTMLElement) {
    yield timeout(SCROLL_DELAY);

    if (this.shouldScroll(appendedMessage)) {
      this.scrollToBottom.perform();
    }
  }).restartable())
  maybeNudge!: Task;

  @(task(function*() {
    const element = document.querySelector('.messages');

    if (element) {
      element.scrollTo({ left: 0, top: element.scrollHeight, behavior: 'smooth' });
    }
  }).restartable())
  scrollToBottom!: Task;

  private shouldScroll(appendedMessage: HTMLElement) {
    const container = document.querySelector('.message-list') as HTMLElement;
    if (!container) return false;

    if (appendedMessage) {
      const rect = appendedMessage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      let fuzzyness = 20; // px
      // Check if there the message is within height's delta of the bottom
      // of the container.
      const isJustOffScreen =
        rect.top >= containerRect.bottom - rect.height - fuzzyness &&
        containerRect.bottom + rect.height + fuzzyness > rect.bottom;

      return isJustOffScreen;
    }

    // Can something that doesn't exist be visible?
    return false;
  }
}
