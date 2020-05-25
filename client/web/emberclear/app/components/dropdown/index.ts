import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface Args {
  buttonIcon?: string;
  buttonText?: string;
  dir?: string;
}

export default class Dropdown extends Component<Args> {
  @tracked isOpen = false;

  get hasButtonText() {
    return Boolean(this.args.buttonText);
  }

  get hasButtonIcon() {
    return Boolean(this.args.buttonIcon);
  }

  @action
  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  @action
  closeMenu() {
    this.isOpen = false;
  }
}
