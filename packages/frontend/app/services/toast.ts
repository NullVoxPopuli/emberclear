import Ember from 'ember';
import Service from '@ember/service';
import { isPresent } from '@ember/utils';

import Toastify from 'toastify-js';
import { waitForPromise } from 'ember-test-waiters';

export default class Toast extends Service {
  info(msg: string, title = '', options = {}) {
    return this.createToast('alert-info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    return this.createToast('alert-success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    return this.createToast('alert-warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    return this.createToast('alert-danger', msg, title, options);
  }

  createToast(status: string, msg: string, title: string, options: any) {
    let message = isPresent(title) ? `${title}: ${msg}` : msg;

    return waitForPromise(createToast(status, message, options));
  }
}

function createToast(status: string, message: string, options: any) {
  let timeout = Ember.testing ? 300 : 4000;

  let toast = Toastify({
    text: message,
    duration: timeout,
    // only relevant on
    newWindow: true,
    close: true,
    // `top` or `bottom`
    gravity: 'top',
    // `left`, `center` or `right`
    position: 'right',
    className: `toast-alert alert ${status}`,
    // Prevents dismissing of toast on hover
    stopOnFocus: true,
    // overrides and such
    ...options,
    // destination / url
  });

  toast.showToast();

  // this is a hack, and this should really be an
  // onRemove callback
  return new Promise((resolve) => {
    setTimeout(resolve, timeout + 5);
  });
}
