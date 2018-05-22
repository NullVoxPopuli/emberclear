import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;

  activate(this: ApplicationRoute) {
    this.identity.load();
    this.relayConnection.connect();
  }
}
