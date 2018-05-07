import Route from '@ember/routing/route';

import { service } from '@ember-decorators/service';

export default class SetupIndexRoute extends Route {
  @service('identity') identity;

  // ensure we are allowed to be here
  beforeModel() {
    if (!this.identity.exists()) {
      this.transitionTo('setup.new');
    }
  }
}
