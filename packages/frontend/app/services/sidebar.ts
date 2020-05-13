import Service, { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import { inLocalStorage } from 'emberclear/utils/decorators';
import { SwipeHandler } from 'emberclear/services/sidebar/swipe-handler';
import { waitForPromise } from 'ember-test-waiters';
import CurrentUserService from 'emberclear/services/current-user';
import { valueOfProperty } from 'emberclear/utils/dom/css';

export default class Sidebar extends Service {
  @service currentUser!: CurrentUserService;

  unreadAbove = A();
  unreadBelow = A();

  unreadObserver?: IntersectionObserver;

  slider?: SwipeHandler;
  contentElement?: HTMLElement;

  @notEmpty('unreadAbove') hasUnreadAbove!: boolean;
  @notEmpty('unreadBelow') hasUnreadBelow!: boolean;

  @inLocalStorage isShown = false;

  @action
  show() {
    this.isShown = true;

    if (this.slider) {
      return waitForPromise(this.slider.open());
    }
  }

  @action
  hide() {
    this.isShown = false;

    if (this.slider) {
      return waitForPromise(this.slider.close());
    }
  }

  @action
  toggle() {
    return this.isShown ? this.hide() : this.show();
  }

  async setup(content: HTMLElement) {
    this.contentElement = content;

    // TODO: would an async observer be good here?
    if (!this.currentUser.isLoggedIn) {
      if (this.slider) {
        await waitForPromise(this.slider.close());
        if (this.slider) {
          this.slider.destroy();
          this.slider = undefined;
        }
      }

      return;
    }

    let container = document.querySelector(
      '.ember-application'
    ) as HTMLElement; /* body or testing container */

    let sidebarWidth = parseInt(valueOfProperty('sidenav-width'));

    this.slider = new SwipeHandler({
      container,
      content,
      sidebarWidth,
      flickRegion: 0.35,
      pushUntilWidth: 768,
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

  public destroy() {
    if (this.slider) {
      this.slider.destroy();
    }

    return super.destroy();
  }
}
