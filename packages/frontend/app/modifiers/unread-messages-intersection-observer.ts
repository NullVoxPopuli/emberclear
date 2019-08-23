import Modifier from 'ember-oo-modifiers';
import { inject as service } from '@ember/service';

import SidebarService from 'emberclear/services/sidebar';

class UnreadMessagesIntersectionObserver extends Modifier {
  @service sidebar!: SidebarService;

  didInsertElement() {
    this.sidebar.ensureUnreadIntersectionObserverExists();

    if (this.sidebar.unreadObserver) {
      this.sidebar.unreadObserver.observe(this.element);
    }
  }

  willDestroyElement() {
    if (this.sidebar.unreadObserver) {
      this.sidebar.unreadObserver.unobserve(this.element);
    }
  }
}

export default Modifier.modifier(UnreadMessagesIntersectionObserver);
