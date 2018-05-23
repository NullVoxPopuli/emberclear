import Service from '@ember/service';
import RSVP from 'rsvp';

import { service } from '@ember-decorators/service';

// TODO: implement sysstem-notifications
export default class Notifications extends Service {
  info(msg: string, title = '', options = {}) {
    this.display('info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    this.display('success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    this.display('warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    this.display('error', msg, title, options);
  }

  async display(status: string, msg: string, title: string, options = {}) {
    const hasPermission = await this.isPermissionGranted();

    return; // toast disabled, because of jQuery. boo jQuery
    if (hasPermission) {
      this.showNotification(msg, title, options);
      return;
    }

    this.toast[status](msg, title, options);
  }

  isPermissionGranted() {
    return new RSVP.Promise((resolve, reject) => {
      if (!('Notification' in window)) return reject();

      if (Notification.permission !== 'denied') {
        Notification.requestPermission(permission => {
          if (permission === 'granted') {
            return resolve()
          }

          return reject();
        });
      }

      return resolve();
    });


  }

  showNotification(msg: string, title: string, options = {}) {
    const notificationOptions = {
      body: msg,
      // icon: ''
      ...options
    };

    return new Notification(title, notificationOptions);
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'notifications': Notifications;
  }
}
