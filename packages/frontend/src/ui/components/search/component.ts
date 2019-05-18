import { later } from '@ember/runloop';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class SearchModal extends Component<IArgs> {
  @service store;

  @tracked searchText = '';
  @tracked identityResults = [];
  @tracked channelResults = [];

  @reads('identityResults.length') numContacts!: number;

  get hasResults() {
    return this.identityResults.length > 0 || this.channelResults.length > 0;
  }

  @action focusInput(element: HTMLInputElement) {
    later(this, () => element.focus());
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

    const identityResults = yield this.store.query('identity', {
      name: term,
    });
    const channelResults = yield this.store.query('channel', {
      name: term,
    });

    this.identityResults = identityResults.filter(i => i.id !== 'me').slice(0, 5);

    this.channelResults = channelResults.slice(0, 5);
  }).keepLatest())
  search: any;
}
