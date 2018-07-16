import Service from '@ember/service';
import { computed } from '@ember-decorators/object';

export default class Sidebar extends Service {
  @computed
  get isShown() {
    const lsValue = localStorage.getItem('sidebarIsShown');

    return  lsValue === 'true';
  }
  set isShown(value: boolean) {
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
