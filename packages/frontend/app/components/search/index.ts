import { once } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';

import StoreService from '@ember-data/store';
import Contact from 'emberclear/models/contact';
import Channel from 'emberclear/models/channel';
import CurrentUserService from 'emberclear/services/current-user';

import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'emberclear/utils/ember-concurrency';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

const MAX_RESULTS = 5;

export default class SearchModal extends Component<IArgs> {
  @service store!: StoreService;
  @service currentUser!: CurrentUserService;

  @tracked searchText = '';
  @tracked contactResults: Contact[] = [];
  @tracked channelResults: Channel[] = [];

  @reads('contactResults.length') numContacts!: number;

  get hasResults() {
    return this.contactResults.length > 0 || this.channelResults.length > 0;
  }

  @action
  focusInput(element: HTMLInputElement) {
    once(this, () => element.focus());
  }

  @action
  submitSearch() {
    taskFor(this.search).perform(this.searchText);
  }

  @action
  onInput(e: Event) {
    this.searchText = (e.target as HTMLInputElement).value;
    this.submitSearch();
  }

  @restartableTask({ withTestWaiter: true })
  *search(searchTerm: string) {
    const term = new RegExp(searchTerm, 'i');

    let [contactResults, channelResults] = yield Promise.all([
      this.store.query('contact', { name: term }),
      this.store.query('channel', { name: term }),
    ]);

    if (term.test(this.currentUser.name || '')) {
      contactResults = contactResults.toArray();
      contactResults.push(this.currentUser.record);
    }

    this.contactResults = contactResults.slice(0, MAX_RESULTS);
    this.channelResults = channelResults.slice(0, MAX_RESULTS);
  }
}
