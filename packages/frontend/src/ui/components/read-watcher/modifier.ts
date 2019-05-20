import Modifier from 'ember-oo-modifiers';
import Message from 'emberclear/data/models/message/model';
import { isInElementWithinViewport } from 'emberclear/src/utils/dom/utils';

interface NamedArgs {
  markRead: () => void;
}

class ReadWatcher extends Modifier {
  io?: IntersectionObserver;
  focusHandler!: () => void;
  message!: Message;
  markMessageRead!: () => void;

  didInsertElement([message]: [Message], { markRead }: NamedArgs) {
    this.message = message;
    this.markMessageRead = markRead;
    this.focusHandler = this.respondToWindowFocus.bind(this);
    this.maybeSetupReadWatcher();
  }

  willDestroyElement() {
    this.disconnect();
  }

  /**
   * if already read, this method happens to do nothing
   * */
  private disconnect() {
    this.io && this.io.unobserve(this.element);
    this.io && this.io.disconnect();
    this.io = undefined;

    // TODO: having the same focus listener per message may not
    //       by ideal. Maybe think of a way to do this more generally
    //       for the entire history, rather than per message.
    // window.removeEventListener('focus', this.focusHandler);
  }

  private markRead() {
    this.markMessageRead();
    this.disconnect();
  }

  private respondToWindowFocus() {
    const container = document.querySelector('.messages')!;
    const isVisible = isInElementWithinViewport(this.element, container);

    if (isVisible) {
      this.markRead();
    }
  }

  private maybeSetupReadWatcher() {
    if (this.message.readAt) return;

    // window.addEventListener('focus', this.focusHandler);
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

export default Modifier.modifier(ReadWatcher);
