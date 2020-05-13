import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import CurrentUserService from 'emberclear/services/current-user';

import { inLocalStorage } from 'emberclear/utils/decorators';

import Toast from 'emberclear/services/toast';
import RouterService from '@ember/routing/router-service';
import WindowService from 'emberclear/services/window';

export default class Notifications extends Service {
  @service toast!: Toast;
  @service intl!: Intl;
  @service currentUser!: CurrentUserService;
  @service router!: RouterService;
  @service window!: WindowService;

  @tracked askToEnableNotifications = true;
  @tracked isHiddenUntilBrowserRefresh = false;

  @inLocalStorage isNeverGoingToAskAgain = false;

  get showInAppPrompt() {
    const promptShouldNotBeShown =
      !this.currentUser.isLoggedIn ||
      this.isOnRouteThatDoesNotShowNotifications ||
      !this.isBrowserCapableOfNotifications ||
      this.isPermissionGranted ||
      this.isPermissionDenied ||
      this.isNeverGoingToAskAgain ||
      this.isHiddenUntilBrowserRefresh;

    if (promptShouldNotBeShown) return false;

    return this.askToEnableNotifications;
  }

  get isOnRouteThatDoesNotShowNotifications() {
    const { currentRouteName } = this.router;

    if (!currentRouteName) return false;

    return currentRouteName.match(/setup/) || currentRouteName.match(/logout/);
  }

  info(msg: string, title = '', options = {}) {
    return this.display(msg, title, options);
  }

  async display(msg: string, title: string, options = {}) {
    if (this.isPermissionGranted) {
      this.showNotification(msg, title, options);
      return;
    }

    // Permission to display desktop notifications has not yet been granted.
    // ask the user if they would like to enable those.
    this.askToEnableNotifications = true;

    return this.toast.info(msg, title, options);
  }

  get isPermissionGranted() {
    if (this.isBrowserCapableOfNotifications) {
      return this.window.Notification.permission === 'granted';
    }

    return false;
  }

  get isPermissionDenied() {
    return this.window.Notification.permission === 'denied';
  }

  askPermission() {
    return new Promise((resolve, reject) => {
      if (!this.isBrowserCapableOfNotifications) return reject();
      if (this.isPermissionDenied) return reject();

      return this.window.Notification.requestPermission((permission) => {
        this.askToEnableNotifications = false;

        return resolve(permission);
      });
    });
  }

  get isBrowserCapableOfNotifications() {
    return 'Notification' in window;
  }

  showNotification(msg: string, title = '', options = {}) {
    const defaultTitle = this.intl.t('ui.notifications.title');
    const notificationOptions = {
      body: msg,
      // tag needed to prevent duplicates
      tag: msg,
      // icon: ''
      ...options,
    };

    return new Notification(title || defaultTitle, notificationOptions);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    notifications: Notifications;
  }
}
