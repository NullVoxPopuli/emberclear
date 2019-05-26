import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import CurrentUserService from 'emberclear/services/current-user/service';

export default class BeginButton extends Component {
  @service currentUser!: CurrentUserService;

  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;
}
