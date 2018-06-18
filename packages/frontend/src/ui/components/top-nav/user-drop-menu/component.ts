import { DS } from 'ember-data';
import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';

import { Registry } from '@ember/service';
import IdentityService from 'emberclear/services/identity/service';

export default class UserDropMenu extends Component {
  @service identity!: IdentityService;
  @service store!: DS.Store;
  @service router!: Registry['router'];

  // tagName = '';
  showDropdown = false;

  classNameBindings = ['showDropdown:is-active']

  @alias('identity.name') name?: string;

  @action
  closeMenu(this: UserDropMenu) {
    this.set('showDropdown', false);
  }
}
