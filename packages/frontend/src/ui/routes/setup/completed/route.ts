import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupCompletedRoute extends Route {
  @service identity!: IdentityService

  model() {
    return this.identity;
  }

  // ensure we are allowed to be here
  beforeModel() {
    if (!this.identity.exists()) {
      this.transitionTo('setup.new');
    }
  }
}
