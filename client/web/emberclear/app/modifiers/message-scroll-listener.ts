import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import Message from 'emberclear/models/message';
import ChatScroller from 'emberclear/services/chat-scroller';

interface Args {
  positional: [Message[]];
  named: EmptyRecord;
}

export default class MessageScrollListener extends Modifier<Args> {
  @service chatScroller!: ChatScroller;

  scrollHandler!: () => void;
  messagesElement!: Element;

  get messages() {
    return this.args.positional[0];
  }

  didInstall() {
    let ticking = false;
    let determine = this.determineIfLastIsVisible.bind(this);

    this.scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          determine();
          ticking = false;
        });

        ticking = true;
      }
    };
  }

  didReceiveArguments() {
    this.messagesElement = this.element!.querySelector('.messages')!;

    if (this.messagesElement) {
      if (!this.chatScroller.isViewingOlderMessages) {
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
      }

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
