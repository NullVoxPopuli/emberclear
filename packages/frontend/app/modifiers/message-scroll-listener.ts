import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import Message from 'emberclear/models/message';
import ChatScroller from 'emberclear/services/chat-scroller';

interface Args {
  positional: [Message[]];
  named: {};
}

function debounced(fn: any) {
  let queued: any;
  return function debouncedCallback() {
    let timeout;
    if (queued) cancelAnimationFrame(queued);
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      queued = requestAnimationFrame(fn);
    }, 50);
  };
}

export default class MessageScrollListener extends Modifier<Args> {
  @service chatScroller!: ChatScroller;

  scrollHandler!: () => void;
  messagesElement!: Element;

  get messages() {
    return this.args.positional[0];
  }

  didInstall() {
    this.scrollHandler = debounced(this.determineIfLastIsVisible.bind(this));

    this.messagesElement = this.element!.querySelector('.messages')!;
  }

  didReceiveArguments() {
    this.messagesElement = this.element!.querySelector('.messages')!;

    if (this.messagesElement) {
      this.messagesElement.removeEventListener('scroll', this.scrollHandler);
      this.messagesElement.addEventListener('scroll', this.scrollHandler);
    }
  }

  willRemove() {
    if (this.messagesElement) {
      this.messagesElement.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private determineIfLastIsVisible() {
    let last = this.messages[this.messages.length - 1];

    this.chatScroller.isLastVisible = this.chatScroller._isLastVisible(last);
  }
}
