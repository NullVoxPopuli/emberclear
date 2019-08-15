import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import StoreService from 'ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';

import RouterService from '@ember/routing/router-service';

export default class UserDropMenu extends Component {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service router!: RouterService;

  @tracked showDropdown = false;

  @reads('currentUser.name') name?: string;

  @action
  closeMenu() {
    this.showDropdown = false;
  }

  @action
  openMenu() {
    this.showDropdown = true;
  }

  @action
  toggleMenu(e) {
    e && e.preventDefault();

    this.showDropdown ? this.closeMenu() : this.openMenu();
  }
}
