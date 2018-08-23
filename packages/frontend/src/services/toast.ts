import Ember from 'ember';
// import { isTesting } from '@ember/testing';

import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { isPresent } from '@ember/utils';


export default class Toast extends Service {
  @service('notification-messages') notifications;

  info(msg: string, title = '', options = {}) {
    this.createToast('info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    this.createToast('success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    this.createToast('warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    this.createToast('error', msg, title, options);
  }

  createToast(status: string, msg: string, title: string, options: any) {
    const message = isPresent(title) ? `${title}: ${msg}` : msg;

    this.notifications.addNotification({
      autoClear: true,
      clearDuration: Ember.testing ? 0 : 4000,
      ...options,
      message: message || '',
      type: status
    });
  }
}
