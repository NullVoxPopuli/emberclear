import Service from '@ember/service';
import { isPresent } from '@ember/utils';

import RSVP from 'rsvp';
import { toast } from 'bulma-toast';

// TODO: implement sysstem-notifications
export default class Notifications extends Service {
  info(msg: string, title = '', options = {}) {
    this.display('is-info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    this.display('is-success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    this.display('is-warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    this.display('is-danger', msg, title, options);
  }

  async display(status: string, msg: string, title: string, options = {}) {
    const hasPermission = await this.isPermissionGranted();

    if (hasPermission) {
      this.showNotification(msg, title, options);
      return;
    }

    this.createToast(status, msg, title, options);
  }

  createToast(status: string, msg: string, title: string, options: any) {
    const message = isPresent(title) ? `${title}: ${msg}` : msg;

    toast({
      message,
      // is-primary, is-link, is-info, is-success, is-warning, is-danger
      // just a css class
      type: status,
      dismissable: true,
      position: 'is-right',
      duration: 2300
    });
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
