import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';
import IdentityService from 'emberclear/services/identity/service';

export default class UserDropMenu extends Component {
  @service identity!: IdentityService;

  showDropdown = false;

  @alias('identity.name') name?: string;

  @action
  closeMenu(this: UserDropMenu) {
    this.set('showDropdown', false);
  }
}
