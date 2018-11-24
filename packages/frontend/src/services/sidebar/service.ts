import Service from '@ember/service';

import { A } from '@ember/array';
import { service } from '@ember-decorators/service';
import { notEmpty } from '@ember-decorators/object/computed';

import { syncToLocalStorage, disableInFastboot } from 'emberclear/src/utils/decorators';

export default class Sidebar extends Service {
  @service fastboot!: FastBoot;

  unreadAbove = A();
  unreadBelow = A();

  unreadObserver?: IntersectionObserver;

  @notEmpty('unreadAbove') hasUnreadAbove!: boolean;
  @notEmpty('unreadBelow') hasUnreadBelow!: boolean;

  @disableInFastboot
  @syncToLocalStorage
  get isShown(): boolean {
    return false;
  }

  show() {
    this.set('isShown', true);
  }

  hide() {
    this.set('isShown', false);
  }

  toggle() {
    this.set('isShown', !this.isShown);
  }

  clearUnreadBelow() {
    this.unreadBelow.clear();
  }

  clearUnreadAbove() {
    this.unreadAbove.clear();
  }

  observeIntersectionOf(id: string) {
    this.ensureUnreadIntersectionObserverExists();

    const target = document.getElementById(id);

    this.unreadObserver!.observe(target!);
  }

  private ensureUnreadIntersectionObserverExists() {
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
    entries.forEach(entry => {
      const target = entry.target;
      const id = target.id;
      const { boundingClientRect, rootBounds, isIntersecting } = entry;
      const isBelow = boundingClientRect.top > rootBounds.bottom;
      const isAbove = boundingClientRect.top < rootBounds.top;

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
