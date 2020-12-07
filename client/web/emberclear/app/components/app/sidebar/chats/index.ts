import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import type ContactManager from 'emberclear/services/contact-manager';

const REQUIRED_CHARACTERS_TO_SEARCH = 2;

export default class ContactsSidebar extends Component {
  @service contactManager!: ContactManager;
  @service intl!: Intl;

  @tracked searchText?: string;

  @tracked _searchText = '';

  @action
  handleSearch(e: Event) {
    this._searchText = (e.target as HTMLInputElement).value;

    if (this.hasEnoughToSearch) {
      this.searchText = this._searchText;

      return;
    }

    if (this.searchText !== undefined) {
      this.searchText = undefined;
    }
  }

  get hasEnoughToSearch() {
    return this._searchText.length >= REQUIRED_CHARACTERS_TO_SEARCH;
  }

  get remainingCharacters() {
    return REQUIRED_CHARACTERS_TO_SEARCH - this._searchText.length;
  }
}
