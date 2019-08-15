import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';

import Modals from 'emberclear/services/modals';

interface IArgs {
  name: string;
  initiallyActive?: boolean;
}

export default class ModalStatic extends Component<IArgs> {
  @service modals!: Modals;

  constructor(owner: any, args: any) {
    super(owner, args);

    const { initiallyActive, name } = this.args;

    if (initiallyActive) {
      this.modals.open(name);
    }
  }

  get modal() {
    return this.modals.find(this.args.name);
  }

  @reads('modal.isActive') isActive!: boolean;

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
