import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupIndexRoute extends Route {
  @service identity!: IdentityService;

  // ensure we are allowed to be here
  async beforeModel() {
    const exists = await this.identity.exists();

    if (exists && !this.identity.allowOverride) {
      this.transitionTo('setup.overwrite');
    }
  }
}
