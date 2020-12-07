import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import SidebarService from 'emberclear/services/sidebar';

export default class UnreadMessagesIntersectionObserver extends Modifier {
  @service declare sidebar: SidebarService;

  didInstall() {
    this.sidebar.ensureUnreadIntersectionObserverExists();

    if (this.sidebar.unreadObserver && this.element) {
      this.sidebar.unreadObserver.observe(this.element);
    }
  }

  willRemove() {
    if (this.sidebar.unreadObserver && this.element) {
      this.sidebar.unreadObserver.unobserve(this.element);
    }
  }
}
