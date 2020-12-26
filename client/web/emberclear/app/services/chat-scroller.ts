import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';

import { timeout } from 'ember-concurrency';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

import type { Message } from '@emberclear/networking';

// This is used to give the task time to restart as the view settles
// and tries to scroll multiple times
const SCROLL_DELAY = 100;

export default class ChatScroller extends Service {
  @tracked isLastVisible = true;

  get isViewingOlderMessages() {
    return !this.isLastVisible;
  }

  _isLastVisible(message: Message) {
    // nothing to show, don't indicate that the last message isn't visible.
    if (!message) return true;

    return isLastVisible(message.id);
  }

  // if the last message is close enough to being in view,
  // scroll to the bottom
  @dropTask
  async maybeNudge(appendedMessage: HTMLElement) {
    await timeout(SCROLL_DELAY);

    if (this.shouldScroll(appendedMessage)) {
      appendedMessage.scrollIntoView({ behavior: 'smooth' });
    }
  }

  @restartableTask
  async scrollToBottom() {
    const element = document.querySelector('.messages');

    if (element) {
      await element.scrollTo({ left: 0, top: element.scrollHeight, behavior: 'smooth' });
    }
  }

  private shouldScroll(appendedMessage: HTMLElement) {
    const container = document.querySelector('.messages') as HTMLElement;

    if (!container) return false;

    if (appendedMessage) {
      const rect = appendedMessage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      let fuzzyness = 50; // px
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

function isLastVisible(id: string) {
  const container = document.querySelector('.message-list') as HTMLElement;

  if (!container) return false;

  const messages = container.querySelectorAll('.message')!;

  if (!messages) return false;

  const lastMessage = document.getElementById(id) || document.querySelector(`[data-id="${id}"]`);

  if (lastMessage) {
    return isBottomOfMessageVisible(lastMessage, container);
  }

  // nothing to show. last is like... square root of -1... or something.
  // if there are indeed messages, then the last one might be occluded
  return messages.length === 0;
}

function isBottomOfMessageVisible(element: HTMLElement, container: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const isVisible = rect.bottom <= containerRect.bottom;

  return isVisible;
}

declare module '@ember/service' {
  interface Registry {
    'chat-scroller': ChatScroller;
  }
}
