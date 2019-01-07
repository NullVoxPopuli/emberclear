import Service from '@ember/service';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/src/services/identity/service';

import { syncToLocalStorage } from 'emberclear/src/utils/decorators';

import Toast from 'emberclear/src/services/toast';

export default class Notifications extends Service {
  @service toast!: Toast;
  @service intl!: Intl;
  @service identity!: IdentityService;
  @service router;

  askToEnableNotifications = true;
  isHiddenUntilBrowserRefresh = false;

  @syncToLocalStorage
  get isNeverGoingToAskAgain() {
    return false;
  }

  @computed(
    'askToEnableNotifications',
    'isHiddenUntilBrowserRefresh',
    'isNeverGoingToAskAgain',
    'identity.isLoggedIn',
    'notInSetup',
    'router.currentRouteName'
  )
  get showInAppPrompt() {
    const promptShouldNotBeShown =
      !this.identity.isLoggedIn ||
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
    return this.display('is-info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    return this.display('is-success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    return this.display('is-warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    return this.display('is-danger', msg, title, options);
  }

  async display(status: string, msg: string, title: string, options = {}) {
    if (this.isPermissionGranted) {
      this.showNotification(msg, title, options);
      return;
    }

    // Permission to display desktop notifications has not yet been granted.
    // ask the user if they would like to enable those.
    this.set('askToEnableNotifications', true);

    this.toast.createToast(status, msg, title, options);
  }

  get isPermissionGranted() {
    if (this.isBrowserCapableOfNotifications) {
      return Notification.permission === 'granted';
    }

    return false;
  }

  get isPermissionDenied() {
    return Notification.permission === 'denied';
  }

  askPermission() {
    return new Promise((resolve, reject) => {
      if (!this.isBrowserCapableOfNotifications) return reject();
      if (this.isPermissionDenied) return reject();

      Notification.requestPermission(permission => {
        if (permission === 'granted') {
          this.set('askToEnableNotifications', false);

          return resolve();
        }

        return reject();
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
