import Route from '@ember/routing/route';
import { Registry as ServiceRegistry } from '@ember/service';

import { service } from '@ember-decorators/service';


export default class SetupIndexRoute extends Route {
  @service identity!: ServiceRegistry['identity'];

  // ensure we are allowed to be here
  beforeModel() {
    if (!this.identity.exists()) {
      this.transitionTo('setup.new');
    }
  }
}
