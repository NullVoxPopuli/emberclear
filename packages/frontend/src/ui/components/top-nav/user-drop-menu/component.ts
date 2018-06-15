import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import IdentityService from 'emberclear/services/identity/service';

export default class UserDropMenu extends Component {
  @service identity!: IdentityService;

  showDropdown = false;

  @alias('identity.name') name?: string;
}
