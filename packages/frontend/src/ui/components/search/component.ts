import { once } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';
import Task from 'ember-concurrency/task';
import StoreService from 'ember-data/store';
import Contact from 'emberclear/src/data/models/contact/model';
import Channel from 'emberclear/data/models/channel';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class SearchModal extends Component<IArgs> {
  @service store!: StoreService;

  @tracked searchText = '';
  @tracked contactResults: Contact[] = [];
  @tracked channelResults: Channel[] = [];

  @reads('contactResults.length') numContacts!: number;

  get hasResults() {
    return this.contactResults.length > 0 || this.channelResults.length > 0;
  }

  @action focusInput(element: HTMLInputElement) {
    once(this, () => element.focus());
  }

  @action submitSearch() {
    this.search.perform(this.searchText);
  }

  @action onInput(e: Event) {
    this.searchText = (e.target as HTMLInputElement).value;
    this.submitSearch();
  }

  @(task(function*(this: SearchModal, searchTerm: string) {
    const term = new RegExp(searchTerm, 'i');

    const contactResults = yield this.store.query('contact', {
      name: term,
    });
    const channelResults = yield this.store.query('channel', {
      name: term,
    });

    this.contactResults = contactResults.filter((i: Contact) => i.id !== 'me').slice(0, 5);

    this.channelResults = channelResults.slice(0, 5);
  }).keepLatest())
  search!: Task;
}
