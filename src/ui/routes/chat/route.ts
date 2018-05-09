import Route from '@ember/routing/route';

import { service } from '@ember-decorators/service';

import { action } from '@ember-decorators/object';


export default class ChatRoute extends Route {
  @service('relay-connection') relaySocket;
  @service('identity') identity;

  activate(this: ApplicationRoute) {
    this.relaySocket.connect();
  }

  // ensure we are allowed to be here
  beforeModel() {
    // if (!this.identity.exists()) {
    //   this.transitionTo('setup');
    // }
  }

}
