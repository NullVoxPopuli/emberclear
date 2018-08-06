import Service from '@ember/service';
import { isPresent } from '@ember/utils';

import { toast } from 'bulma-toast';

export default class Toast extends Service {
  info(msg: string, title = '', options = {}) {
    this.createToast('is-info', msg, title, options);
  }

  success(msg: string, title = '', options = {}) {
    this.createToast('is-success', msg, title, options);
  }

  warning(msg: string, title = '', options = {}) {
    this.createToast('is-warning', msg, title, options);
  }

  error(msg: string, title = '', options = {}) {
    this.createToast('is-danger', msg, title, options);
  }

  createToast(status: string, msg: string, title: string, options: any) {
    const message = isPresent(title) ? `${title}: ${msg}` : msg;

    toast({
      message,
      // is-primary, is-link, is-info, is-success, is-warning, is-danger
      // just a css class
      type: status,
      dismissable: true,
      position: 'top-right',
      duration: 3500,
      ...options
    });
  }
}
