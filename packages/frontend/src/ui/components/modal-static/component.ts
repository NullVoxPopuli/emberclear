import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

import Modals from 'emberclear/services/modals';

interface IArgs {
  name: string;
  initiallyActive?: boolean;
}

export default class ModalStatic extends Component<IArgs> {
  @service modals!: Modals;

  didInsertElement() {
    const { initiallyActive, name } = this.args;

    if (initiallyActive) {
      this.modals.open(name);
    }
  }

  // @computed('args.name')
  get modal() {
    return this.modals.find(this.args.name);
  }

  @reads('modal.isActive') isActive!: boolean;

  toggle() {
    if (this.isActive) {
      this.close();
    } else {
      this.open();
    }
  }

  close() {
    this.modals.close(this.args.name);
  }

  open() {
    this.modals.open(this.args.name);
  }
}
