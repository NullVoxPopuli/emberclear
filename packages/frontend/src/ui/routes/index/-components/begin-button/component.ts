import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class BeginButton extends Component {
  @service identity!: IdentityService;

  @reads('identity.isLoggedIn') isLoggedIn!: boolean;
}


