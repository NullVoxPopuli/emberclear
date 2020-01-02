import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Modals from 'emberclear/services/modals';

interface IArgs {
  name: string;
  initiallyActive?: boolean;
}

export default class ModalStatic extends Component<IArgs> {
  @service modals!: Modals;

  constructor(owner: any, args: any) {
    super(owner, args);

    let { initiallyActive, name } = this.args;

    if (initiallyActive) {
      this.modals.open(name);
    }
  }

  get modal() {
    return this.modals.find(this.args.name);
  }

  get isActive() {
    return this.modal.isActive;
  }

  @action
  toggle() {
    if (this.isActive) {
      this.close();
    } else {
      this.open();
    }
  }

  @action
  close() {
    this.modals.close(this.args.name);
  }

  @action
  open() {
    this.modals.open(this.args.name);
  }
}
