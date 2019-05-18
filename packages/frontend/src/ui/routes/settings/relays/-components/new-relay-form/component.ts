import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import StoreService from 'ember-data/store';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import { hostFromURL } from 'emberclear/src/utils/string/utils';

export default class NewRelayForm extends Component {
  @service store!: StoreService;

  @tracked isVisible = false;
  @tracked socketURL = '';
  @tracked openGraphURL = '';

  @(task(function*() {
    const host = hostFromURL(this.socketURL);
    const existing = yield this.store.findAll('relay');
    const priority = existing.length + 1;
    const record = this.store.createRecord('relay', {
      socket: this.socketURL,
      og: this.openGraphURL,
      host,
      priority,
    });

    yield record.save();
    this.reset();
  }).drop())
  save;

  toggleForm() {
    this.isVisible = !this.isVisible;
  }

  private reset() {
    this.isVisible = false;
    this.socketURL = '';
    this.openGraphURL = '';
  }
}
