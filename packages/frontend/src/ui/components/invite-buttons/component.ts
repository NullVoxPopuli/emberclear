import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import Modals from 'emberclear/services/modals';

export default class InviteButtons extends Component {
  @service modals!: Modals;

  beforeClick?: () => void;

  @action
  toggleModal(name: string) {
    if (this.beforeClick) {
      this.beforeClick();
    }


    this.modals.toggle(name);
  }
}
