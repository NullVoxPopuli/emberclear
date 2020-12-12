import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { hostFromURL } from 'emberclear/utils/string/utils';

import type StoreService from '@ember-data/store';
import type Relay from 'emberclear/models/relay';

export default class NewRelayForm extends Component {
  @service store!: StoreService;

  @tracked isVisible = false;
  @tracked socketURL = '';
  @tracked openGraphURL = '';

  @action
  submit() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.save).perform();
  }

  @dropTask
  async save() {
    const host = hostFromURL(this.socketURL);
    const existing = await this.store.findAll('relay');
    const priority = ((existing as any) as Relay[]).length + 1;
    const record = this.store.createRecord('relay', {
      socket: this.socketURL,
      og: this.openGraphURL,
      host,
      priority,
    });

    await record.save();

    this.reset();
  }

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
