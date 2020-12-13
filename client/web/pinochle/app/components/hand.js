import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class HandComponent extends Component {
  @tracked isActive = false;

  @action
  toggle() {
    this.isActive = !this.isActive;
  }
}
