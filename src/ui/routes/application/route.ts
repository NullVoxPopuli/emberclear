import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';

export default class ApplicationRoute extends Route {
  @service relayConnection!: RelayConnection;

  activate(this: ApplicationRoute) {
    this.relayConnection.connect();
  }
}
