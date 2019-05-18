import Modifier from 'ember-oo-modifiers';
import { inject as service } from '@ember/service';

class UnreadMessagesIntersectionObserver extends Modifier {
  @service sidebar;

  didInsertElement() {
    this.sidebar.ensureUnreadIntersectionObserverExists();
    this.sidebar.unreadObserver.observe(this.element);
  }

  willDestroyElement() {
    this.sidebar.unreadObserver.unobserve(this.element);
  }
}

export default Modifier.modifier(UnreadMessagesIntersectionObserver);
