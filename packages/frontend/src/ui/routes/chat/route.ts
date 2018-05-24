import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayConnection from 'emberclear/services/relay-connection';

export default class ChatRoute extends Route {
  @service relayConnection!: RelayConnection
  @service identity!: IdentityService
  @service fastboot!: FastBoot;

  // ensure we are allowed to be here
  async beforeModel() {
    if (this.fastboot.isFastBoot) return;

    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
    }

    this.relayConnection.connect();
  }
}
