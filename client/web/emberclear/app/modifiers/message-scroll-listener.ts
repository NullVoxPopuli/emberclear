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
    // if (this.element) {
    //   if (!this.chatScroller.isViewingOlderMessages) {
    //     this.element.scrollTop = this.messagesElement.scrollHeight;
    //   }

    //   this.element.removeEventListener('scroll', this.scrollHandler);
    //   this.element.addEventListener('scroll', this.scrollHandler);
    // }
  }

  willRemove() {
    if (this.element) {
      this.element.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private determineIfLastIsVisible() {
    let last = this.messages[this.messages.length - 1];

    this.chatScroller.isLastVisible = this.chatScroller._isLastVisible(last);
  }
}
