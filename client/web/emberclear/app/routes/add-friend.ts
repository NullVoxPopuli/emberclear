import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import RedirectManager from 'emberclear/services/redirect-manager';

export default class AddFriendRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service redirectManager!: RedirectManager;

  beforeModel() {
    // identity should be loaded from application route
    if (this.currentUser.isLoggedIn) {
      this.redirectManager.evaluate();

      return;
    }

    // no identity, need to create one
    this.transitionTo('setup');
  }
}
