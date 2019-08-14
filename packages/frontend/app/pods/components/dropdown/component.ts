import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { notEmpty } from '@ember/object/computed';
import { action } from '@ember/object';

export default class Dropdown extends Component {
  @tracked isOpen = false;

  @notEmpty('buttonText') hasButtonText!: boolean;
  @notEmpty('buttonIcon') hasButtonIcon!: boolean;

  @action
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  @action
  closeMenu() {
    this.isOpen = false;
  }
}
