import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { once } from '@ember/runloop';

import ChatScroller from 'emberclear/services/chat-scroller';

export default class MaybeNudgeToBottom extends Modifier {
  @service chatScroller!: ChatScroller;

  didInstall() {
    if (this.element) {
      once(
        this.chatScroller,
        this.chatScroller.maybeNudgeToBottom.bind(this.chatScroller, this.element as HTMLElement)
      );
    }
  }

  // NOTE: this method should not exist, but does
  //       because vertical-collection recycles
  //       nodes
  didUpdateArguments() {
    this.didInstall();
  }
}
