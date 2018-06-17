import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';
import IdentityService from 'emberclear/services/identity/service';
import { Registry } from '@ember/service';

export default class UserDropMenu extends Component {
  @service identity!: IdentityService;
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
