import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayConnection from 'emberclear/services/relay-connection';

export default class ChatRoute extends Route {
  @service relayConnection!: RelayConnection
  @service identity!: IdentityService

  activate(this: ChatRoute) {
    this.relayConnection.connect();
  }

  // ensure we are allowed to be here
  async beforeModel() {
    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
    }
  }
}
