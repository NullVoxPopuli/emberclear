import Service from '@ember/service';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

export default class Sidebar extends Service {
  @service fastboot!: FastBoot;

  @computed
  get isShown() {
    if (this.fastboot.isFastBoot) return false;

    const lsValue = localStorage.getItem('sidebarIsShown');

    return  lsValue === 'true';
  }
  set isShown(value: boolean) {
    if (this.fastboot.isFastBoot) return;

    const lsValue = value ? 'true' : 'false';

    localStorage.setItem('sidebarIsShown', lsValue);
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
