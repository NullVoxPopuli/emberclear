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
    let content = document.querySelector('main#scrollContainer');
    this.contentElement = content;

    let sidebarWidth = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--sidenav-width')
        .split('px')[0]
    );
    let isDragging = false;
    let lastX = 0;

    function handleDrag(e) {
      // left is closing -- 300px -> 0px
      // right is opening -- 0px -> 300px
      if (!isDragging) {
        isDragging = true;
        lastX = content.offsetLeft;
      }

      let nextX = e.deltaX + lastX;

      if (nextX > sidebarWidth) {
        content.style.left = `${sidebarWidth}px`;
      } else if (nextX < 0) {
        content.style.left = `${0}px`;
      } else {
        content.style.left = `${nextX}px`;
      }

      if (e.isFinal) {
        isDragging = false;

        // is far enough?
        if (e.direction === Hammer.DIRECTION_LEFT) {
          if (content.offsetLeft < sidebarWidth / 2) {
            content.style.left = 0;
          } else {
            content.style.left = `${sidebarWidth}px`;
          }
        } else {
          // if (e.direction === Hammer.DIRECTION_RIGHT) {
          if (content.offsetLeft > sidebarWidth / 2) {
            content.style.left = `${sidebarWidth}px`;
          } else {
            content.style.left = 0;
          }
        }
      }
    }

    let options = {
      dragLockToAxis: true,
      dragBlockHorizontal: true,
      dragMinDistance: 5,
    };
    let hammertime = new Hammer(document, options);
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.on('panleft panright swipeleft swiperight panend', e => {
      switch (e.type) {
        case 'swiperight':
          return this.show();
        case 'swipeleft':
          return this.hide();
        case 'panleft':
          return handleDrag(e);
        case 'panright':
          return handleDrag(e);
        case 'panend':
          return handleDrag(e);
        default:
          console.info('gesture not handled', e);
      }
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
