import Route from '@ember/routing/route';
import { Registry as ServiceRegistry } from '@ember/service';

import { service } from '@ember-decorators/service';

export default class ApplicationRoute extends Route {
  @service relayConnection!: ServiceRegistry['relay-connection'];

  activate(this: ApplicationRoute) {
    this.relayConnection.connect();
  }
}
