import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupIndexRoute extends Route {
  @service identity!: IdentityService;

  async beforeModel() {
    const exists = await this.identity.exists();

    if (exists && !this.identity.allowOverride) {
      this.transitionTo('setup.overwrite');
    }
  }
}
