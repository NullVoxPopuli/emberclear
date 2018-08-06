import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import Modals from 'emberclear/services/modals';

export default class extends Controller {
  @service modals!: Modals;

  @action
  toggleModal(name: string) {
    this.modals.toggle(name);
  }
}
