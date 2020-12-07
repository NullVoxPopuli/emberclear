import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import RedirectManager from 'emberclear/services/redirect-manager';

export default class AddFriendRoute extends Route {
  @service declare currentUser: CurrentUserService;
  @service declare redirectManager: RedirectManager;

  async beforeModel() {
    // identity should be loaded from application route
    if (this.currentUser.isLoggedIn) {
      await this.redirectManager.evaluate();

      return;
    }

    // no identity, need to create one
    await this.transitionTo('setup');
  }
}
