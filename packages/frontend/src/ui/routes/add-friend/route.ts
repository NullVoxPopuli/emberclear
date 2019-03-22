import Route from '@ember/routing/route';
import { inject as service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RedirectManager from 'emberclear/services/redirect-manager/service';

export default class AddFriendRoute extends Route {
  @service identity!: IdentityService;
  @service redirectManager!: RedirectManager;

  beforeModel() {
    // identity should be loaded from application route
    if (this.identity.isLoggedIn) {
      this.redirectManager.evaluate();
      return;
    }

    // no identity, need to create one
    this.transitionTo('setup');
  }
}
