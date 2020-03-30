import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import StoreService from '@ember-data/store';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import { hostFromURL } from 'emberclear/utils/string/utils';
import Task from 'ember-concurrency/task';

export default class NewRelayForm extends Component {
  @service store!: StoreService;

  @tracked isVisible = false;
  @tracked socketURL = '';
  @tracked openGraphURL = '';

  @action
  submit() {
    this.save.perform();
  }

  @(task(function* (this: NewRelayForm) {
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
  save!: Task;

  @action
  toggleForm() {
    this.isVisible = !this.isVisible;
  }

  @action
  private reset() {
    this.isVisible = false;
    this.socketURL = '';
    this.openGraphURL = '';
  }
}
