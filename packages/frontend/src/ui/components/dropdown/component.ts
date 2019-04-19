import Component from '@ember/component';
import { notEmpty } from '@ember/object/computed';
import { action } from '@ember/object';

export default class Dropdown extends Component {
  classNames = ['dropdown'];
  classNameBindings = ['up:is-up', 'isOpen:is-active'];

  isOpen = false;

  @notEmpty('buttonText') hasButtonText!: boolean;
  @notEmpty('buttonIcon') hasButtonIcon!: boolean;

  @action
  toggleMenu() {
    this.set('isOpen', !this.isOpen);
  }

  @action
  closeMenu() {
    this.set('isOpen', false);
  }
}
