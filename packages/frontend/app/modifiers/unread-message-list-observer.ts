import Modifier from 'ember-modifier';
import StoreService from '@ember-data/store';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import Task from 'ember-concurrency/task';

import SidebarService from 'emberclear/services/sidebar';
import Message from 'emberclear/models/message';

import { isInElementWithinViewport } from 'emberclear/utils/dom/utils';
import { markAsRead } from 'emberclear/models/message/utils';

export default class UnreadMessagesIntersectionObserver extends Modifier {
  @service sidebar!: SidebarService;
  @service store!: StoreService;

  focusHandler!: () => void;

  didInstall() {
    this.focusHandler = this.respondToWindowFocus.bind(this);

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

        this.markRead.perform(record);
      }
    });
  }

  @(task(function*(message: Message) {
    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      if (message.readAt) {
        return;
      }

      if (message.isSaving || !document.hasFocus()) {
        yield timeout(10);
      } else {
        yield markAsRead(message);
        return;
      }
    }
  })
    .maxConcurrency(30)
    .enqueue()
    .withTestWaiter())
  markRead!: Task;
}
