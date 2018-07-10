import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';

import Modals from 'emberclear/services/modals';

export default class ModalContainer extends Component {
  @service modals!: Modals;

  name!: string;

  @computed('name')
  get modal() {
    return this.modals.find(this.name);
  }

  @reads('modal.isActive') isActive;

  @action
  toggle(this: ModalContainer) {
    this.modals.toggle(this.name);
  }
}
