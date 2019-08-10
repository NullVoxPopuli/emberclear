import Modifier from 'ember-oo-modifiers';
import StoreService from 'ember-data/store';
import { inject as service } from '@ember/service';

import SidebarService from 'emberclear/services/sidebar/service';

import { isInElementWithinViewport } from 'emberclear/src/utils/dom/utils';
import Message from 'emberclear/data/models/message/model';

interface NamedArgs {
  markRead: (message: Message) => void;
}

class UnreadMessagesIntersectionObserver extends Modifier {
  @service sidebar!: SidebarService;
  @service store!: StoreService;

  focusHandler!: () => void;
  markRead!: (message: Message) => void;

  didInsertElement(_positional: any, { markRead }: NamedArgs) {
    this.focusHandler = this.respondToWindowFocus.bind(this);
    this.markRead = markRead;

    window.addEventListener('focus', this.focusHandler);
  }

  willDestroyElement() {
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

export default Modifier.modifier(UnreadMessagesIntersectionObserver);
