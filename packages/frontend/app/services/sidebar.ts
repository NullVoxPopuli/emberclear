import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import { inLocalStorage } from 'emberclear/utils/decorators';
import { SwipeHandler } from 'emberclear/services/sidebar/swipe-handler';

export default class Sidebar extends Service {
  unreadAbove = A();
  unreadBelow = A();

  unreadObserver?: IntersectionObserver;

  @tracked sidebarElement;
  @tracked contentElement;

  @notEmpty('unreadAbove') hasUnreadAbove!: boolean;
  @notEmpty('unreadBelow') hasUnreadBelow!: boolean;

  @inLocalStorage isShown = false;

  show() {
    this.isShown = true;
    this.sidebarElement.classList.add('active');
    this.contentElement.classList.add('sidebar-open');
  }

  hide() {
    this.isShown = false;
    this.sidebarElement.classList.remove('active');
    this.contentElement.classList.remove('sidebar-open');
  }

  @action toggle() {
    this.isShown ? this.hide() : this.show();
  }

  setup(sidebar: HTMLElement) {
    this.sidebarElement = sidebar;
    let content = document.querySelector('main#scrollContainer') as HTMLElement;
    this.contentElement = content;

    let sidebarWidth = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sidenav-width')
        .split('px')[0]
    );

    let handler = new SwipeHandler({
      content,
      sidebarWidth,
      flickRegion: 0.35,
      pushUntilWidth: 768,
    });

    handler.start();
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
