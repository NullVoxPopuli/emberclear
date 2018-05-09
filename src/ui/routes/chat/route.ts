import Route from '@ember/routing/route';

import { service } from '@ember-decorators/service';

import { action } from '@ember-decorators/object';
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';


export default class ChatRoute extends Route {
  @service('relay-connection') relaySocket!: RelayConnection;
  @service('identity') identity!: IdentityService;

  activate(this: ChatRoute) {
    this.relaySocket.connect();
  }

  // ensure we are allowed to be here
  beforeModel() {
    // if (!this.identity.exists()) {
    //   this.transitionTo('setup');
    // }
  }

}
