import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import type StoreService from '@ember-data/store';
import type Channel from 'emberclear/models/channel';
import type Contact from 'emberclear/models/contact';
import type CurrentUserService from 'emberclear/services/current-user';

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

  constructor(owner: unknown, args: IArgs) {
    super(owner, args);

    this.submitSearch();
  }

  get numContacts() {
    return this.contactResults.length;
  }

  get hasResults() {
    return this.contactResults.length > 0 || this.channelResults.length > 0;
  }

  @action
  submitSearch() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.search).perform(this.searchText);
  }

  @action
  onInput(e: Event) {
    this.searchText = (e.target as HTMLInputElement).value;
    this.submitSearch();
  }

  @restartableTask({ withTestWaiter: true })
  async search(searchTerm: string) {
    const term = new RegExp(searchTerm, 'i');

    let [contactResults, channelResults] = await Promise.all([
      this.store.query('contact', { name: term }),
      this.store.query('channel', { name: term }),
    ]);

    if (term.test(this.currentUser.name || '')) {
      contactResults = contactResults.toArray() as any;
      contactResults.push(this.currentUser.record);
    }

    this.contactResults = contactResults.slice(0, MAX_RESULTS);
    this.channelResults = channelResults.slice(0, MAX_RESULTS);
  }
}
