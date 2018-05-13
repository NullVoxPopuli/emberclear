import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupIndexRoute extends Route {
  @service identity!: IdentityService;

  // ensure we are allowed to be here
  beforeModel() {
    if (!this.identity.exists()) {
      this.transitionTo('setup.new');
    } else {
      this.transitionTo('setup.overwrite');
    }
  }
}
