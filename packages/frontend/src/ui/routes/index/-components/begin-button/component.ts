import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class BeginButton extends Component {
  @service identity!: IdentityService;

  @reads('identity.isLoggedIn') isLoggedIn!: boolean;
}
