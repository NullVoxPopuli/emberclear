import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import Hammer from 'hammerjs';

import { inLocalStorage } from 'emberclear/utils/decorators';

export default class Sidebar extends Service {
  unreadAbove = A();
  unreadBelow = A();

  unreadObserver?: IntersectionObserver;

  @tracked slideout;

  @notEmpty('unreadAbove') hasUnreadAbove!: boolean;
  @notEmpty('unreadBelow') hasUnreadBelow!: boolean;

  @inLocalStorage isShown = false;

  show() {
    this.isShown = true;
  }

  hide() {
    this.isShown = false;
  }

  @action toggle() {
    // this.slideout.toggle();
  }

  setup(sidebar: HTMLElement) {
    // detect hammer events on the whole document
    let content = document.querySelector('main#scrollContainer');
    let hammer = new Hammer.Manager(document);
    let swipe = new Hammer.Swipe({
      threshold: 70,
      direction: Hammer.DIRECTION_HORIZONTAL,
    });

    hammer.add(swipe);

    hammer.on('swiperight', () => {
      sidebar.classList.add('active');
      content.classList.add('sidebar-open');
      this.show();
    });

    hammer.on('swipeleft', () => {
      sidebar.classList.remove('active');
      content.classList.remove('sidebar-open');
      this.hide();
    });
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
