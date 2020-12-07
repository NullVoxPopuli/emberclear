import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/models/message';
import { taskFor } from 'ember-concurrency-ts';

type Args = {
  positional: [Message[], Message];
  named: EmptyRecord;
};

export default class MaybeNudgeToBottom extends Modifier<Args> {
  @service declare chatScroller: ChatScroller;

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
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      taskFor(this.chatScroller.maybeNudge).perform(this.element as HTMLElement);
    }
  }
}
