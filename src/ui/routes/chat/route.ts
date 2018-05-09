import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { Registry as ServiceRegistry } from '@ember/service';

export default class ChatRoute extends Route {
  @service relayConnection!: ServiceRegistry['relay-connection'];
  @service identity!: ServiceRegistry['identity'];

  activate(this: ChatRoute) {
    this.relayConnection.connect();
  }

  // ensure we are allowed to be here
  beforeModel() {
    // if (!this.identity.exists()) {
    //   this.transitionTo('setup');
    // }
  }

}
