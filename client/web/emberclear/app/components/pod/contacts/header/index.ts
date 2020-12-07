import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type StoreService from '@ember-data/store';

export default class extends Component {
  @service store!: StoreService;

  get contacts() {
    return this.store.peekAll('contact');
  }
}
