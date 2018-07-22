import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import { syncToLocalStorage, disableInFastboot } from 'emberclear/src/utils/decorators';

export default class Sidebar extends Service {
  @service fastboot!: FastBoot;

  @disableInFastboot
  @syncToLocalStorage
  get isShown(): boolean {
    return false;
  }

  show() {
    this.set('isShown', true);
  }

  hide() {
    this.set('isShown', false);
  }

  toggle() {
    this.set('isShown', !this.isShown);
  }
}
