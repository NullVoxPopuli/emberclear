import Modifier from 'ember-class-based-modifier';
import { inject as service } from '@ember/service';

import SidebarService from 'emberclear/services/sidebar';

export default class UnreadMessagesIntersectionObserver extends Modifier {
  @service sidebar!: SidebarService;

  didInstall() {
    this.sidebar.ensureUnreadIntersectionObserverExists();

    if (this.sidebar.unreadObserver) {
      this.sidebar.unreadObserver.observe(this.element);
    }
  }

  willRemove() {
    if (this.sidebar.unreadObserver) {
      this.sidebar.unreadObserver.unobserve(this.element);
    }
  }
}
