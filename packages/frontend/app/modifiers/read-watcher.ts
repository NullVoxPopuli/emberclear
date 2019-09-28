import Modifier from 'ember-class-based-modifier';

import Message from 'emberclear/models/message';

interface NamedArgs {
  markRead: () => void;
}

export default class ReadWatcher extends Modifier {
  io?: IntersectionObserver;
  message!: Message;
  markMessageRead!: () => void;

  didInstall() {
    let [message] = this.args.positional;
    let { markRead } = this.args.named;
    
    this.message = message;
    this.markMessageRead = markRead;
    this.maybeSetupReadWatcher();
  }

  willRemove() {
    this.disconnect();
  }

  /**
   * if already read, this method happens to do nothing
   * */
  private disconnect() {
    this.io && this.io.unobserve(this.element);
    this.io && this.io.disconnect();
    this.io = undefined;
  }

  private markRead() {
    this.markMessageRead();
    this.disconnect();
  }

  private maybeSetupReadWatcher() {
    if (this.message.readAt) return;

    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    const io = new IntersectionObserver(
      entries => {
        const isVisible = entries[0].intersectionRatio !== 0;
        const canBeSeen = !this.message.isSaving && document.hasFocus();

        if (isVisible && canBeSeen) {
          this.markRead();
        }
      },
      {
        root: document.querySelector('.messages'),
      }
    );

    io.observe(this.element);

    this.io = io;
  }
}
