import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayConnection from 'emberclear/services/relay-connection';

export default class ChatRoute extends Route {
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;

  async model() {
    return this.modelFor('chat');
  }
}
