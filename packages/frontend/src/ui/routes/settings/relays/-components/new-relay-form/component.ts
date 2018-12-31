import Component, { tracked } from 'sparkles-component';
import StoreService from 'ember-data/store';
import { service } from '@ember-decorators/service';
import { dropTask } from 'ember-concurrency-decorators';

import { hostFromURL } from 'emberclear/src/utils/string/utils';

export default class NewRelayForm extends Component {
  @service store!: StoreService;

  @tracked isVisible = false;
  @tracked socketURL = '';
  @tracked openGraphURL = '';

  @dropTask *save(this: NewRelayForm) {
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
  }

  toggleForm() {
    this.isVisible = !this.isVisible;
  }

  private reset() {
    this.isVisible = false;
    this.socketURL = '';
    this.openGraphURL = '';
  }
}
