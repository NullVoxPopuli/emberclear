import Component from 'sparkles-component';

import Message from 'emberclear/data/models/message/model';
import { isInElementWithinViewport } from 'emberclear/src/utils/dom/utils';

interface IArgs {
  message: Message;
  markRead: () => void;
}

export default class ReadWatcher extends Component<IArgs> {
  messageElement!: Element;
  io?: IntersectionObserver;
  focusHandler!: () => void;

  constructor(args: IArgs) {
    super(args);

    this.focusHandler = this.respondToWindowFocus.bind(this);
  }

  didInsertElement() {
    this.messageElement = document.getElementById(this.args.message.id)!;
    this.maybeSetupReadWatcher();
  }

  willDestroyElement() {
    this.disconnect();
  }

  /**
   * if already read, this method happens to do nothing
   * */
  private disconnect() {
    this.io && this.io.unobserve(this.messageElement);
    this.io && this.io.disconnect();
    this.io = undefined;

    window.removeEventListener('focus', this.focusHandler);
  }

  private markRead() {
    this.args.markRead();
    this.disconnect();
  }

  private respondToWindowFocus() {
    const container = document.querySelector('.messages')!;
    const isVisible = isInElementWithinViewport(this.messageElement, container);

    if (isVisible) {
      this.markRead();
    }
  }

  private maybeSetupReadWatcher() {
    const { message } = this.args;

    if (message.readAt) return;

    window.addEventListener('focus', this.focusHandler);
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    const { message } = this.args;

    const io = new IntersectionObserver(
      entries => {
        const isVisible = entries[0].intersectionRatio !== 0;
        const canBeSeen = !message.isSaving && document.hasFocus();

        if (isVisible && canBeSeen) {
          this.markRead();
        }
      },
      {
        root: document.querySelector('.messages'),
      }
    );

    io.observe(this.messageElement);

    this.io = io;
  }
}
