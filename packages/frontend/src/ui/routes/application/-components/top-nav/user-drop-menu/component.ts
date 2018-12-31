import { DS } from 'ember-data';
import Component, { tracked } from 'sparkles-component';
import uuid from 'uuid';
import { later } from '@ember/runloop';

import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';

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
