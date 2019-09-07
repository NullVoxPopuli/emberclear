import Ember from 'ember';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

function statusToClass(status: string) {
  switch (status) {
    case 'info':
      return 'alert-info';
    case 'success':
      return 'alert-success';
    case 'warning':
      return 'alert-warning';
    case 'error':
      return 'alert-danger';
    default:
      return '';
  }
}
export default class Toast extends Service {
  // from ember-cli-notifications
  @service('notification-messages') notifications!: any;

  clear() {
    this.notifications.clear();
  }

  clearAll() {
    this.notifications.clearAll();
  }

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

    const colorClass = statusToClass(status);

    this.notifications.addNotification({
      autoClear: true,
      clearDuration: Ember.testing ? 100 : 4000,
      ...options,
      message: message || 'status',
      type: status,
      cssClasses: `
        toast-alert
        alert
        ${colorClass}`,
    });
  }
}
