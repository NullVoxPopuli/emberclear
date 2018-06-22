import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayConnection from 'emberclear/services/relay-connection';

export default class ChatRoute extends Route {
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;
  @service fastboot!: FastBoot;

  // ensure we are allowed to be here
  beforeModel() {
    if (this.fastboot.isFastBoot) return;

    // identity should be loaded from application route
    if (this.identity.isLoggedIn) return;

    // no identity, need to create one
    this.transitionTo('setup');
  }

  // TODO: filter to the room
  async model() {
    if (this.fastboot.isFastBoot) return;

    const records = this.store.findAll('message', { backgroundReload: true });

    return RSVP.hash({ messages: records });
  }

  async afterModel() {
    if (this.fastboot.isFastBoot) return;

    this.relayConnection.connect();
  }
}
