import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class extends Controller {
  @service identity!: IdentityService;

  @alias('identity.isLoggedIn') isLoggedIn!: boolean;
}
