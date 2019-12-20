import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Footer extends Component {
  @tracked showMoneroAddress = false;

  @action toggleMoneroAddress() {
    this.showMoneroAddress = !this.showMoneroAddress;
  }
}
