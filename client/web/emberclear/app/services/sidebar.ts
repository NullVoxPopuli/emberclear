import Service, { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import { inLocalStorage } from 'emberclear/utils/decorators';
import CurrentUserService from 'emberclear/services/current-user';

export default class Sidebar extends Service {
  @service currentUser!: CurrentUserService;

  unreadAbove = A();
  unreadBelow = A();

  unreadObserver?: IntersectionObserver;

  @notEmpty('unreadAbove') hasUnreadAbove!: boolean;
  @notEmpty('unreadBelow') hasUnreadBelow!: boolean;

  @inLocalStorage isShown = false;

  @action
  show() {
    this.isShown = true;
  }

  @action
  hide() {
    this.isShown = false;
  }

  @action
  toggle() {
    return this.isShown ? this.hide() : this.show();
  }

  clearUnreadBelow() {
    this.unreadBelow.clear();
  }

  clearUnreadAbove() {
    this.unreadAbove.clear();
  }

  ensureUnreadIntersectionObserverExists() {
    if (this.unreadObserver) return;

    this.unreadObserver = this.createUnreadObserver();
  }

  private createUnreadObserver(): IntersectionObserver {
    const callback = this.handleIntersectionEvent.bind(this);
    const io = new IntersectionObserver(callback, {
      root: document.querySelector('.sidebar-wrapper aside.menu'),
      rootMargin: '-50px 0px -50px 0px',
    });

    return io;
  }

  private handleIntersectionEvent(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      const target = entry.target;
      const id = target.id;
      const { boundingClientRect, rootBounds, isIntersecting } = entry;
      const isBelow = rootBounds ? boundingClientRect.top > rootBounds.bottom : false;
      const isAbove = rootBounds ? boundingClientRect.top < rootBounds.top : false;

      if (isIntersecting) {
        this.unreadAbove.removeObject(id);
        this.unreadBelow.removeObject(id);
      }

      if (isBelow) {
        this.unreadBelow.addObject(id);
      }

      if (isAbove) {
        this.unreadAbove.addObject(id);
      }
    });
  }
}
