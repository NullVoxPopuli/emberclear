import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import ModalsService from 'emberclear/services/modals';

export default class Modals extends Component {
  @service modals!: ModalsService;

  get isAnyVisible() {
    return this.modals.hasAnyActive;
  }

  @action
  closeLast() {
    this.modals.closeLast();
  }
}
