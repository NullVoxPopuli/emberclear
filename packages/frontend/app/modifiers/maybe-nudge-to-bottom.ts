import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/models/message';
import { taskFor } from 'emberclear/utils/ember-concurrency';

type Args = {
  positional: [Message[], Message];
  named: {};
};

export default class MaybeNudgeToBottom extends Modifier<Args> {
  @service chatScroller!: ChatScroller;

  get messages() {
    return this.args.positional[0];
  }

  get appendedMessage() {
    return this.args.positional[1];
  }

  get lastMessage() {
    let messages = this.messages;

    return messages[messages.length - 1];
  }

  didInstall() {
    if (this.appendedMessage.id !== this.lastMessage.id) return;

    if (this.element) {
      taskFor(this.chatScroller.maybeNudge).perform(this.element as HTMLElement);
    }
  }
}
