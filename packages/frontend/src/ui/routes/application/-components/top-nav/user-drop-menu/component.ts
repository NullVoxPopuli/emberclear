import { DS } from 'ember-data';
import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import uuid from 'uuid';
import { later } from '@ember/runloop';

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import { Registry } from '@ember/service';
import IdentityService from 'emberclear/services/identity/service';
import { keepInViewPort } from 'emberclear/src/utils/dom/utils';

export default class UserDropMenu extends Component {
  @service identity!: IdentityService;
  @service store!: DS.Store;
  @service router!: Registry['router'];

  @tracked showDropdown = false;
  @tracked dropDownId = uuid();

  @reads('identity.name') name?: string;

  get dropDown(): HTMLElement {
    return document.querySelector(`[id="${this.dropDownId}"]`) as HTMLElement;
  }

  closeMenu() {
    this.showDropdown = false;
  }

  openMenu() {
    this.showDropdown = true;

    later(this, () => keepInViewPort(this.dropDown));
  }

  toggleMenu() {
    this.showDropdown ? this.closeMenu() : this.openMenu();
  }
}
