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
    let flickRegion = 0.35;
    let openThreshold = sidebarWidth * flickRegion;
    let closeThreshold = sidebarWidth * (1 - flickRegion);

    let isDragging = false;
    let initialX = 0;
    let currentX;
    let isOpening = false;
    let isClosing = false;

    function handleDrag(e) {
      // left is closing -- 300px -> 0px
      // right is opening -- 0px -> 300px
      if (!isDragging) {
        isDragging = true;
        initialX = content.getBoundingClientRect().left;
      }

      currentX = content.getBoundingClientRect().left;

      // direction is none on a final event / panend
      if (e.direction !== Hammer.DIRECTION_NONE) {
        isOpening = e.direction === Hammer.DIRECTION_RIGHT;
        isClosing = e.direction === Hammer.DIRECTION_LEFT;
      }

      let deltaX = 0;
      let deltaXFromStart = e.deltaX;
      let nextX = deltaXFromStart + initialX;
      let shouldClose = nextX < closeThreshold;
      let shouldOpen = nextX > openThreshold;
      let isFullyOpen = nextX >= sidebarWidth;
      let isFullyClosed = nextX <= 0;

      if (isFullyOpen) {
        nextX = sidebarWidth;
        if (isOpening) {
          deltaX = 0;
        } else {
          deltaX = nextX - currentX;
        }
      } else if (isFullyClosed) {
        nextX = 0;
        if (isClosing) {
          deltaX = 0;
        } else {
          deltaX = nextX - currentX;
        }
      }

      if (e.isFinal) {
        isDragging = false;

        // is far enough?
        if (isClosing) {
          if (shouldClose) {
            nextX = 0;
          } else {
            nextX = sidebarWidth;
          }
        } else {
          // if (isOpening) {
          if (shouldOpen) {
            nextX = sidebarWidth;
          } else {
            nextX = 0;
          }
        }

        deltaX = nextX - currentX;
      }
      console.log({
        isClosing,
        isFullyOpen,
        isFullyClosed,
        isOpening,
        shouldClose,
        shouldOpen,
        currentX,
        nextX,
        deltaX,
      });

      content.style.setProperty('--dx', `${deltaX}px`);
      content.style.transform = `translateX(${nextX}px)`;
    }

    let options = {
      dragLockToAxis: true,
      dragBlockHorizontal: true,
      dragMinDistance: 20,
    };
    let hammertime = new Hammer(document, options);
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
    hammertime.on('panleft panright _swipeleft _swiperight panend', e => {
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
