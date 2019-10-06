import Modifier from 'ember-class-based-modifier';
import StoreService from 'ember-data/store';
import { inject as service } from '@ember/service';

import SidebarService from 'emberclear/services/sidebar';

import { isInElementWithinViewport } from 'emberclear/utils/dom/utils';
import Message from 'emberclear/models/message';

interface Args {
  positional: [];
  named: {
    markRead: (message: Message) => void;
  };
}

export default class UnreadMessagesIntersectionObserver extends Modifier<Args> {
  @service sidebar!: SidebarService;
  @service store!: StoreService;

  focusHandler!: () => void;
  markRead!: (message: Message) => void;

  didInstall() {
    let { markRead } = this.args.named;

    this.focusHandler = this.respondToWindowFocus.bind(this);
    this.markRead = markRead;

    window.addEventListener('focus', this.focusHandler);
  }

  willRemove() {
    window.removeEventListener('focus', this.focusHandler);
  }

  private respondToWindowFocus() {
    const container = document.querySelector('.messages')!;
    const messages = container.querySelectorAll('.message');

    messages.forEach(message => {
      const isVisible = isInElementWithinViewport(message, container);

      if (isVisible) {
        const record = this.store.peekRecord('message', message.id);

        this.markRead(record);
      }
    });
  }
}
