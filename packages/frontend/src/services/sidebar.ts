import Service from '@ember/service';

export default class Sidebar extends Service {
  isShown = false;

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
