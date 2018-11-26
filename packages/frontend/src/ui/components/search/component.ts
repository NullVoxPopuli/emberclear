import Component, { tracked } from 'sparkles-component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
import { keepLatestTask } from 'ember-concurrency-decorators';
import uuid from 'uuid';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class SearchModal extends Component<IArgs> {
  @service store;

  @tracked searchText = '';
  inputId = uuid();
  inputElement!: HTMLInputElement;

  @tracked identityResults = [];
  @tracked channelResults = [];

  @reads('identityResults.length') numContacts!: number;

  @tracked('identityResults', 'channelResults')
  get hasResults() {
    return (
      this.identityResults.length > 0
      || this.channelResults.length > 0
    );
  }

  didInsertElement() {
    this.search.perform('');
    this.inputElement = document.getElementById(this.inputId) as HTMLInputElement;
  }

  didUpdate() {
    this.inputElement.focus();
  }

  submitSearch() {
    this.search.perform(this.searchText);
  }

  @keepLatestTask * search(searchTerm: string) {
    const term = new RegExp(searchTerm, 'i');

    // https://github.com/genkgo/ember-localforage-adapter/blob/master/addon/adapters/localforage.js#L104
    const identityResults = yield this.store.query('identity', {
      name: term
    });
    const channelResults = yield this.store.query('channel', {
      name: term
    });

    this.identityResults = identityResults
      .filter(i => i.id !== 'me')
      .slice(0, 5);

    this.channelResults = channelResults
      .slice(0, 5);
  }
}
