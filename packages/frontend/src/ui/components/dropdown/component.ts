import Component from '@ember/component';
import { notEmpty } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';

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
}
