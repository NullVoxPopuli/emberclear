import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupCompletedRoute extends Route {
  @service identity!: IdentityService;

  model() {
    return this.identity;
  }

  // ensure we are allowed to be here
  async beforeModel() {
    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup.new');
    }
  }
}
