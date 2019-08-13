import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import Slideout from 'slideout';

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
    this.slideout.toggle();
  }

  setup(sidebar: HTMLElement) {
    this.slideout = new Slideout({
      panel: document.getElementById('scrollContainer'),
      menu: sidebar,
      tolerance: 70,
    });

    if (this.isShown) {
      this.slideout.open();
    }

    this.slideout.on('open', () => this.show());
    this.slideout.on('close', () => this.hide());
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
